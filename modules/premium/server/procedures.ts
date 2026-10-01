import { eq, count } from 'drizzle-orm'
// Internal imports
import { db } from '@/db'
import { polar } from '@/lib/polar'
import { agents, meetings } from '@/db/schema'
import { protectedProcedure, createTRPCRouter } from '@/trpc/init'

export const premiumRouter = createTRPCRouter({
  getFreeUsage: protectedProcedure.query(async ({ ctx }) => {
    const customer = await polar.customers.getStateExternal(ctx.auth.user.id)
    // Allow multiple subscriptions is disabled from Settings -> Preferences -> Subscriptions
    const subscription = customer.active_subscriptions[0]
    if (subscription) {
      return null
    }
    const [userMeetings] = await db
      .select({
        count: count(meetings.id),
      })
      .from(meetings)
      .where(eq(meetings.userId, ctx.auth.user.id))

    const [userAgents] = await db
      .select({
        count: count(agents.id),
      })
      .from(agents)
      .where(eq(agents.userId, ctx.auth.user.id))

    return {
      meetingCount: userMeetings.count,
      agentCount: userAgents.count,
    }
  }),

  getProducts: protectedProcedure.query(async () => {
    const products = await polar.products.list({
      is_archived: false,
      is_recurring: true,
      sorting: ['price_amount'],
    })
    return products.items
  }),

  getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
    const customer = await polar.customers.getStateExternal(ctx.auth.user.id)
    const subscription = customer.active_subscriptions[0]
    if (!subscription) {
      return null
    }
    const product = await polar.products.get(subscription.product_id)
    return product
  }),
})
