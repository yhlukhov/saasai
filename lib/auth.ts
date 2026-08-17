import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/app/db'
import * as schema from '@/app/db/schema'

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            enabled: true,
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema
    })
})
