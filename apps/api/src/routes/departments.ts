import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

type Bindings = {
  DB: D1Database
}

const departments = new Hono<{ Bindings: Bindings }>()

departments.get('/', async (c) => {
  const prisma = new PrismaClient()
  try {
    const result = await prisma.department.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return c.json(result)
  } catch (error) {
    return c.json({ error: 'Failed to fetch departments' }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

departments.get('/:id', async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    const result = await prisma.department.findUnique({
      where: { id },
      include: {
        certifications: true,
        shifts: true
      }
    })
    if (!result) {
      return c.json({ error: 'Department not found' }, 404)
    }
    return c.json(result)
  } catch (error) {
    return c.json({ error: 'Failed to fetch department' }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

departments.post('/', async (c) => {
  const prisma = new PrismaClient()
  try {
    const body = await c.req.json()
    const { code, name, description, isActive } = body
    
    const result = await prisma.department.create({
      data: {
        code,
        name,
        description,
        isActive: isActive ?? true
      }
    })
    return c.json(result, 201)
  } catch (error) {
    return c.json({ error: 'Failed to create department' }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

departments.put('/:id', async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    const body = await c.req.json()
    const { code, name, description, isActive } = body
    
    const result = await prisma.department.update({
      where: { id },
      data: {
        code,
        name,
        description,
        isActive
      }
    })
    return c.json(result)
  } catch (error) {
    return c.json({ error: 'Failed to update department' }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

departments.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    await prisma.department.delete({
      where: { id }
    })
    return c.json({ message: 'Department deleted successfully' })
  } catch (error) {
    return c.json({ error: 'Failed to delete department' }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

export default departments