import { app } from '@studybuddy/backend/app'
import { testClient } from 'hono/testing'

export const client = testClient(app)
