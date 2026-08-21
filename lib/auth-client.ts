import { createAuthClient } from 'better-auth/react'

const DEFAULT_BASE = 'http://localhost:3000'

export const authClient = createAuthClient({
  baseURL: DEFAULT_BASE
})