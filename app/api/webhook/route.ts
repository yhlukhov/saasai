import OpenAI from 'openai'
import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import {ChatCompletionMessageParam} from 'openai/resources'

import {
  CallEndedEvent,
  CallTranscriptionReadyEvent,
  CallSessionParticipantLeftEvent,
  CallRecordingReadyEvent,
  CallSessionStartedEvent,
  MessageNewEvent
} from '@stream-io/node-sdk'

import { db } from '@/db'
import { buildInstructions } from './chat-instructions'
import { agents, meetings } from '@/db/schema'
import { streamVideo } from '@/lib/stream-video'
import { inngest } from '@/inngest/client'
import { generateAvatarUri } from '@/lib/avatar'
import { streamChat } from '@/lib/stream-chat'

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-signature')
  const apiKey = req.headers.get('x-api-key')
  if (!signature || !apiKey) {
    return NextResponse.json(
      { error: 'Missing signature or API key' },
      { status: 400 },
    )
  }

  const body = Buffer.from(await req.arrayBuffer())
  if (apiKey !== process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY) {
    console.error('[webhook] Stream API key does not match the configured app')
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = streamVideo.verifyAndParseWebhook(body, signature)
  } catch {
    console.error('[webhook] Stream signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const eventType = (payload as Record<string, unknown>)?.type

  if (eventType === 'call.session_started') {
    const event = payload as CallSessionStartedEvent
    const meetingId = event.call.custom?.meetingId
    if (!meetingId) {
      return NextResponse.json({ error: 'Missing meetingId' }, { status: 400 })
    }

    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(and(eq(meetings.id, meetingId), eq(meetings.status, 'upcoming')))
    if (!existingMeeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    await db
      .update(meetings)
      .set({
        status: 'active',
        startedAt: new Date(),
      })
      .where(eq(meetings.id, existingMeeting.id))

    const [existingAgent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, existingMeeting.agentId))
    if (!existingAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const call = streamVideo.video.call('default', meetingId)
    try {
      const realtimeClient = await streamVideo.video.connectOpenAi({
        call,
        openAiApiKey: process.env.OPENAI_API_KEY!,
        agentUserId: existingAgent.id,
      })

      realtimeClient.updateSession({
        instructions: `${existingAgent.instructions}\n\nLanguage requirement: Speak in English in every response. If the user speaks another language, understand them and reply in their language.`,
        turn_detection: { type: 'server_vad' },
      })
    } catch (error) {
      console.error('[webhook] Failed to connect OpenAI agent', {
        meetingId,
        agentId: existingAgent.id,
        error,
      })
      return NextResponse.json(
        { error: 'Failed to connect agent' },
        { status: 500 },
      )
    }
  }
  else if (eventType === 'call.session_participant_left') {
    const event = payload as CallSessionParticipantLeftEvent
    const meetingId = event.call_cid.split(':')[1] // call_cid = "type:id"
    if (!meetingId) {
      return NextResponse.json({ error: 'Missing meetingId' }, { status: 400 })
    }
    const call = streamVideo.video.call('default', meetingId)
    await call.end()
  } else if (eventType === 'call.session_ended') {
    const event = payload as CallEndedEvent
    const meetingId = event.call.custom?.meetingId
    if (!meetingId) {
      return NextResponse.json({ error: 'Missing meetingId' }, { status: 400 })
    }
    await db
      .update(meetings)
      .set({
        status: 'processing',
        endedAt: new Date(),
      })
      .where(and(eq(meetings.id, meetingId), eq(meetings.status, 'active')))
  }
  else if (eventType === 'call.transcription_ready') {
    const event = payload as CallTranscriptionReadyEvent
    const meetingId = event.call_cid.split(':')[1]
    const [updatedMeeting] = await db
      .update(meetings)
      .set({
        transcriptUrl: event.call_transcription.url,
      })
      .where(eq(meetings.id, meetingId))
      .returning()
    if (!updatedMeeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }
    await inngest.send({
      name: 'meetings/processing',
      data: {
        meetingId: updatedMeeting.id,
        transcriptUrl: updatedMeeting.transcriptUrl,
      },
    })
  }
  else if (eventType === 'call.recording_ready') {
    const event = payload as CallRecordingReadyEvent
    const meetingId = event.call_cid.split(':')[1]
    await db
      .update(meetings)
      .set({
        recordingUrl: event.call_recording.url,
      })
      .where(eq(meetings.id, meetingId))
  }
  else if (eventType === 'message.new') {
    const event = payload as MessageNewEvent
    const userId = event.user?.id
    const channelId = event.channel?.id
    const text = event.message.text
    if (!userId || !channelId) {
      return NextResponse.json(
        {error: "Missing required fields"},
        {status: 400}
      )
    }
    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(and(eq(meetings.id, channelId), eq(meetings.status, 'completed')))
    if (!existingMeeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }
    const [existingAgent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, existingMeeting.agentId))
    if (!existingAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    if (userId !== existingAgent.id) {
      const channel = streamChat.channel('messaging', channelId)
      await channel.watch()
      const previousMessages = channel.state.messages
        .slice(-5)
        .filter(msg => msg.text && msg.text.trim() !== "")
        .map<ChatCompletionMessageParam>(message => ({
          role: message.user?.id === existingAgent.id ? 'assistant' : 'user',
          content: message.text || ''
        }))
      const GPTResponse = await openaiClient.chat.completions.create({
        messages: [
          {role: 'system', content: buildInstructions(existingMeeting.summary, existingAgent.instructions)},
          ...previousMessages,
          {role: 'user', content: text}
        ],
        model: 'gpt-6-luna'
      })
      const GPTResponseText = GPTResponse.choices[0].message.content
      if(!GPTResponseText) {
        return NextResponse.json(
          {error: 'No response from GPT'},
          {status: 400}
        )
      }
      const avatarUri = generateAvatarUri({
          seed: existingAgent.name,
          variant: 'botttsNeutral',
        })
      streamChat.upsertUser({
        id: existingAgent.id,
        name: existingAgent.name,
        image: avatarUri,
      })
      channel.sendMessage({
        text: GPTResponseText,
        user: {
          id: existingAgent.id,
          name: existingAgent.name,
          image: avatarUri,
        },
      })
    }

  }

  return NextResponse.json({ status: 'ok' })
}
