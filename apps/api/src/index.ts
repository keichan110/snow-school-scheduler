import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors())

app.get('/', (c) => {
  return c.json({ message: 'Snow School Scheduler API' })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

export default app