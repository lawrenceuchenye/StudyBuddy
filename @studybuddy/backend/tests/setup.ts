import { app } from '@studybuddy/backend/app'
import { hc } from 'hono/client'
import { testClient } from 'hono/testing'

// export const client = testClient(app)

export const client = hc<typeof app>("http://127.0.0.1:5000")
