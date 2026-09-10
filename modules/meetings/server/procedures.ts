import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { sql, and, count, desc, eq, getColumns, ilike } from 'drizzle-orm'

import { db } from '@/db'
import { agents, meetings, meetingStatus } from '@/db/schema'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'
import {
  DEFAULT_PAGE,
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from '@/constants'
import { meetingsInsertSchema, meetingsUpdateSchema } from '../schemas'

export const meetingsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [existingMeeting] = await db
        .select({
          ...getColumns(meetings),
        })
        .from(meetings)
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
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input
      const data = await db
        .select({
          ...getColumns(meetings),
        })
        .from(meetings)
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined,
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
        .where(
          and(
            eq(meetings.userId, ctx.auth.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined,
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

      // TODO: Create stream call, upseart stream users
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
})
