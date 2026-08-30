import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { agents } from '@/db/schema'
import { agentsInsertSchema } from '../schemas'
import {
  createTRPCRouter,
  protectedProcedure,
} from '@/trpc/init'

export const agentsRouter = createTRPCRouter({
  
  getOne: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const [existingAgent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, input.id))
      return existingAgent
    }),
  
  getMany: protectedProcedure.query(async () => {
    return await db.select().from(agents)
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
