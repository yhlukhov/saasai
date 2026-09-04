import { z } from 'zod'

export const agentsInsertSchema = z.object({
    name: z.string().min(1, { message: 'Agent name is required' }),
    instructions: z.string().min(1, {message: 'Agent instructions must be specified'})
})

export const agentsUpdateSchema = agentsInsertSchema.extend({
    id: z.string().min(1, { message: 'Agent id is required' })
})