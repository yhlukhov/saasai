import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { eq, getColumns, ilike, sql, and, desc, count } from 'drizzle-orm'

import { db } from '@/db'
import { agents } from '@/db/schema'
import { agentsInsertSchema } from '../schemas'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from '@/constants'

export const agentsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const [existingAgent] = await db
        .select({
          //! Change to actual count:
          meetingCount: sql<number>`3`,
          ...getColumns(agents),
        })
        .from(agents)
        .where(and(
          eq(agents.id, input.id),
          eq(agents.userId, ctx.auth.user.id)
        ))
      if(!existingAgent) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent not found' } )
      }
      return existingAgent
    }),

  getMany: protectedProcedure
    .input(
      z
        .object({
          page: z.number().min(1).default(DEFAULT_PAGE),
          pageSize: z
            .number()
            .min(MIN_PAGE_SIZE)
            .max(MAX_PAGE_SIZE)
            .default(DEFAULT_PAGE_SIZE),
          search: z.string().nullish(),
        })
    )
    .query(async ({ ctx, input }) => {
      const {page, pageSize, search} = input
      const data = await db
        .select({
          //! Change to actual count:
          meetingCount: sql<number>`3`,
          ...getColumns(agents),
        })
        .from(agents)
        .where(
          and(
            eq(agents.userId, ctx.auth.user.id),
            search ? ilike(agents.name, `%${search}%`) : undefined,
          ),
        )
        .orderBy(desc(agents.createdAt), desc(agents.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize)

      const total = await db
        .select({
          count: count(),
        })
        .from(agents)
        .where(
          and(
            eq(agents.userId, ctx.auth.user.id),
            search ? ilike(agents.name, `%${search}%`) : undefined,
          ),
        )

      const totalPages = Math.ceil(total[0].count / pageSize)

      return { items:data, total: total[0].count, totalPages }
    }),

  create: protectedProcedure
    .input(agentsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, instructions } = input
      const [createdAgent] = await db
        .insert(agents)
        .values({
          name,
          instructions,
          userId: ctx.auth.user.id,
        })
        .returning()
      return createdAgent
    }),
})
