import { and, eq, not } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import {
  CallEndedEvent,
  CallTranscriptionReadyEvent,
  CallSessionParticipantLeftEvent,
  CallRecordingReadyEvent,
  CallSessionStartedEvent,
} from '@stream-io/node-sdk'

import { db } from '@/db'
import { agents, meetings } from '@/db/schema'
import { streamVideo } from '@/lib/stream-video'
import { headers } from 'next/headers'

function verifySignatoreWithSDK(body: string | Buffer, signature: string) {
  return streamVideo.verifyWebhook(body, signature)
}

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
    console.log('!CALL.SESSION_STARTED!')
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
        instructions: existingAgent.instructions,
      })
      realtimeClient.createResponse() //* added by ai
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
  } else if (eventType === 'call.session_participant_left') {
    console.log('!CALL.SESSION_PARTICIPANT_LEFT!')
    const event = payload as CallSessionParticipantLeftEvent
    const meetingId = event.call_cid.split(':')[1] // call_cid = "type:id"
    if (!meetingId) {
      return NextResponse.json({ error: 'Missing meetingId' }, { status: 400 })
    }
    const call = streamVideo.video.call('default', meetingId)
    await call.end()
  }

  return NextResponse.json({ status: 'ok' })
}
