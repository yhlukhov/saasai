import { z } from 'zod'
import JSONL from 'jsonl-parse-stringify'
import { TRPCError } from '@trpc/server'
import {
  sql,
  and,
  count,
  desc,
  eq,
  getColumns,
  ilike,
  inArray,
} from 'drizzle-orm'

import { db } from '@/db'
import { agents, meetings, user } from '@/db/schema'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'
import {
  DEFAULT_PAGE,
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from '@/constants'
import {
  meetingsInsertSchema,
  meetingsRemoveSchema,
  meetingsUpdateSchema,
} from '../schemas'
import { MeetingStatus, StreamTranscriptItem } from '../types'
import { streamVideo } from '@/lib/stream-video'
import { generateAvatarUri } from '@/lib/avatar'
import { streamChat } from '@/lib/stream-chat'

export const meetingsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [existingMeeting] = await db
        .select({
          ...getColumns(meetings),
          agent: agents,
          duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as(
            'duration',
          ),
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(eq(meetings.id, input.id), eq(meetings.userId, ctx.auth.user.id)),
        )
      if (!existingMeeting) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Meeting not found' })
      }
      return existingMeeting
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
        agentId: z.string().nullish(),
        status: z
          .enum([
            MeetingStatus.Active,
            MeetingStatus.Cancelled,
            MeetingStatus.Completed,
            MeetingStatus.Processing,
            MeetingStatus.Upcoming,
          ])
          .nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, status, agentId } = input
      const data = await db
        .select({
          ...getColumns(meetings),
          agent: agents,
          duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as(
            'duration',
          ),
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined,
            status ? eq(meetings.status, status) : undefined,
            agentId ? eq(meetings.agentId, agentId) : undefined,
          ),
        )
        .orderBy(desc(meetings.createdAt), desc(meetings.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize)

      const [total] = await db
        .select({
          count: count(),
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined,
            status ? eq(meetings.status, status) : undefined,
            agentId ? eq(meetings.agentId, agentId) : undefined,
          ),
        )

      const totalPages = Math.ceil(total.count / pageSize)

      return {
        items: data,
        total: total.count,
        totalPages,
      }
    }),

  create: protectedProcedure
    .input(meetingsInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const [createdMeeting] = await db
        .insert(meetings)
        .values({
          ...input,
          userId: ctx.auth.user.id,
        })
        .returning()

      const call = streamVideo.video.call('default', createdMeeting.id)
      await call.create({
        data: {
          created_by_id: ctx.auth.user.id,
          custom: {
            meetingId: createdMeeting.id,
            meetingName: createdMeeting.name,
          },
          settings_override: {
            transcription: {
              language: 'en',
              mode: 'auto-on',
              closed_caption_mode: 'auto-on',
            },
            recording: {
              mode: 'auto-on',
              quality: '360p',
            },
          },
        },
      })
      const [existingAgent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, createdMeeting.agentId))
      if (!existingAgent) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent not found' })
      }
      await streamVideo.upsertUsers([
        {
          id: existingAgent.id,
          name: existingAgent.name,
          image: generateAvatarUri({
            seed: existingAgent.name,
            variant: 'botttsNeutral',
          }),
        },
      ])

      return createdMeeting
    }),

  update: protectedProcedure
    .input(meetingsUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, agentId, name } = input
      const [updatedMeeting] = await db
        .update(meetings)
        .set({ name, agentId })
        .where(and(eq(meetings.id, id), eq(meetings.userId, ctx.auth.user.id)))
        .returning()
      if (!updatedMeeting) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Meeting not found' })
      }
      return updatedMeeting
    }),

  remove: protectedProcedure
    .input(meetingsRemoveSchema)
    .mutation(async ({ input, ctx }) => {
      const { id } = input
      const [removedMeeting] = await db
        .delete(meetings)
        .where(and(eq(meetings.id, id), eq(meetings.userId, ctx.auth.user.id)))
        .returning()
      if (!removedMeeting) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Meeting not found' })
      }
      return removedMeeting
    }),

  generateToken: protectedProcedure.mutation(async ({ ctx }) => {
    const { id, name, image } = ctx.auth.user
    await streamVideo.upsertUsers([
      {
        id,
        name,
        role: 'admin',
        image: image ?? generateAvatarUri({ seed: name, variant: 'initials' }),
      },
    ])
    const token = streamVideo.generateUserToken({
      user_id: id
    })
    return token
  }),

  getTranscript: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [existingMeeting] = await db
        .select()
        .from(meetings)
        .where(
          and(eq(meetings.id, input.id), eq(meetings.userId, ctx.auth.user.id)),
        )
      if (!existingMeeting) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Meeting not found' })
      }
      if (!existingMeeting.transcriptUrl) {
        return []
      }
      const transcript = await fetch(existingMeeting.transcriptUrl)
        .then((res) => res.text())
        .then((text) => JSONL.parse<StreamTranscriptItem>(text))
        .catch(() => [])

      const speakerIds = [...new Set(transcript.map((item) => item.speaker_id))]
      const userSpeakers = await db
        .select()
        .from(user)
        .where(inArray(user.id, speakerIds))
        .then((users) =>
          users.map((user) => ({
            ...user,
            image:
              user.image ??
              generateAvatarUri({ seed: user.name, variant: 'initials' }),
          })),
        )
      const agentSpeakers = await db
        .select()
        .from(agents)
        .where(inArray(agents.id, speakerIds))
        .then((agents) =>
          agents.map((agent) => ({
            ...agent,
            image: generateAvatarUri({
              seed: agent.name,
              variant: 'botttsNeutral',
            }),
          })),
        )
      const speakers = [...userSpeakers, ...agentSpeakers]

      const transcriptWithSpeakers = transcript.map((item) => {
        const speaker = speakers.find(
          (speaker) => speaker.id === item.speaker_id,
        )
        if (!speaker) {
          return {
            ...item,
            user: {
              name: 'Unknown',
              image: generateAvatarUri({
                seed: 'Unknown',
                variant: 'initials',
              }),
            },
          }
        }
        return {
          ...item,
          user: {
            name: speaker?.name,
            image: speaker?.image,
          },
        }
      })
      return transcriptWithSpeakers
    }),

  generateChatToken: protectedProcedure.mutation(async ({ctx}) => {
    const {id} = ctx.auth.user
    const token = streamChat.createToken(id)
    await streamChat.upsertUser({
      id,
      role: 'admin'
    })
    return token
  })
})
