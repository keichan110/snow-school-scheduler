import { Hono } from 'hono'
import { cors } from 'hono/cors'
import departments from './routes/departments'
import certifications from './routes/certifications'
import instructors from './routes/instructors'
import instructorCertifications from './routes/instructor-certifications'
import shiftTypes from './routes/shift-types'
import shifts from './routes/shifts'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors())

app.get('/', (c) => {
  return c.json({ 
    message: 'Snow School Scheduler API',
    version: '1.0.0',
    endpoints: {
      departments: '/api/departments',
      certifications: '/api/certifications',
      instructors: '/api/instructors',
      instructorCertifications: '/api/instructor-certifications',
      shiftTypes: '/api/shift-types',
      shifts: '/api/shifts',
      shiftAssign: '/api/shifts/{id}/assign'
    }
  })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.route('/api/departments', departments)
app.route('/api/certifications', certifications)
app.route('/api/instructors', instructors)
app.route('/api/instructor-certifications', instructorCertifications)
app.route('/api/shift-types', shiftTypes)
app.route('/api/shifts', shifts)

export default app