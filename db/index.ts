import { drizzle } from 'drizzle-orm/neon-http'

export const db = drizzle(process.env.NEON_DB_URL!)
