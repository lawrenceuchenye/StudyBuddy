import { App } from '@studybuddy/backend/app'
import { hc } from 'hono/client'

export const client = hc<App>("http://127.0.0.1:5000")
