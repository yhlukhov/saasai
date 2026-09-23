import JSONL from 'jsonl-parse-stringify'
import { inngest } from '@/inngest/client'
import type { StreamTranscriptItem } from '@/modules/meetings/types'
import { createAgent, openai, TextMessage } from '@inngest/agent-kit'
import { agents, meetings, user } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { SYS_PROMPT } from './const'
import { db } from '@/db'

const summarizer = createAgent({
  name: 'summarizer',
  system: SYS_PROMPT.trim(),
  model: openai({
    model: 'gpt-4o',
    apiKey: process.env.OPENAI_API_KEY,
  }),
})

export const meetingsProcessing = inngest.createFunction(
  {
    id: 'meetings/processing',
    triggers: {
      event: 'meetings/processing',
    },
  },
  async ({ event, step }) => {
    const response = await step.run('fetch-transcript', async () => {
      return fetch(event.data.transcriptUrl).then((res) => res.text())
    })

    const transcript = await step.run('parse-transcript', async () => {
      return JSONL.parse<StreamTranscriptItem>(response)
    })

    const transcriptWithSpeakers = await step.run('add-speakers', async () => {
      const speakerIds = [...new Set(transcript.map((item) => item.speaker_id))]

      const userSpeakers = await db
        .select()
        .from(user)
        .where(inArray(user.id, speakerIds))
        .then((users) => users.map((user) => ({ ...user })))

      const agentSpeakers = await db
        .select()
        .from(agents)
        .where(inArray(agents.id, speakerIds))
        .then((agents) => agents.map((agent) => ({ ...agent })))

      const speakers = [...userSpeakers, ...agentSpeakers]

      return transcript.map((item) => {
        const speaker = speakers.find(
          (speaker) => speaker.id === item.speaker_id,
        )
        if (!speaker) {
          return {
            ...item,
            user: {
              name: 'Unknown',
            },
          }
        }
        return {
          ...item,
          user: {
            name: speaker.name,
          },
        }
      })
    })

    const {output} = await summarizer.run(
      'Summarize the following transcript: ' +
        JSON.stringify(transcriptWithSpeakers),
    )

    await step.run("save-summary", async () => {
      await db
        .update(meetings)
        .set({
          summary: (output[0] as TextMessage).content as string,
          status: 'completed'
        })
        .where(eq(meetings.id, event.data.meetingId))
    })
  },
)
