import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import {polar, checkout, portal} from '@polar-sh/better-auth'
//-- internal imports
import { db } from '@/db'
import { polarCore } from './polar'
import * as schema from '@/db/schema'

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        github: {
            enabled: true,
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
        google: {
            enabled: true,
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema
    }),
    plugins: [
        polar({
            client: polarCore,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    authenticatedUsersOnly: true,
                    successUrl: '/upgrade'
                }),
                portal()
            ]
        })
    ]
})
