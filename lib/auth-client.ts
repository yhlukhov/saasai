import { createAuthClient } from 'better-auth/react'
import { polarClient } from '@polar-sh/better-auth'

const DEFAULT_BASE = 'http://localhost:3000'

export const authClient = createAuthClient({
  baseURL: DEFAULT_BASE,
  plugins: [
    polarClient()
  ]
})