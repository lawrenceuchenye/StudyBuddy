import { app } from '@studybuddy/backend/app'
import { hc } from 'hono/client'

export const client = hc<typeof app>("http://127.0.0.1:5000")
