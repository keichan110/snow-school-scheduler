import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

type Bindings = {
  DB: D1Database
}

const certifications = new Hono<{ Bindings: Bindings }>()

certifications.get('/', async (c) => {
  const prisma = new PrismaClient()
  try {
    const result = await prisma.certification.findMany({
      include: {
        department: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return c.json(result)
  } catch (error) {
    return c.json({ error: 'Failed to fetch certifications' }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

certifications.get('/:id', async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    const result = await prisma.certification.findUnique({
      where: { id },
      include: {
        department: true,
        instructorCertifications: {
          include: {
            instructor: true
          }
        }
      }
    })
    if (!result) {
      return c.json({ error: 'Certification not found' }, 404)
    }
    return c.json(result)
  } catch (error) {
    return c.json({ error: 'Failed to fetch certification' }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

certifications.post('/', async (c) => {
  const prisma = new PrismaClient()
  try {
    const body = await c.req.json()
    const { departmentId, name, shortName, organization, description, isActive } = body
    
    const result = await prisma.certification.create({
      data: {
        departmentId,
        name,
        shortName,
        organization,
        description,
        isActive: isActive ?? true
      },
      include: {
        department: true
      }
    })
    return c.json(result, 201)
  } catch (error) {
    return c.json({ error: 'Failed to create certification' }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

certifications.put('/:id', async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    const body = await c.req.json()
    const { departmentId, name, shortName, organization, description, isActive } = body
    
    const result = await prisma.certification.update({
      where: { id },
      data: {
        departmentId,
        name,
        shortName,
        organization,
        description,
        isActive
      },
      include: {
        department: true
      }
    })
    return c.json(result)
  } catch (error) {
    return c.json({ error: 'Failed to update certification' }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

certifications.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    await prisma.certification.delete({
      where: { id }
    })
    return c.json({ message: 'Certification deleted successfully' })
  } catch (error) {
    return c.json({ error: 'Failed to delete certification' }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

export default certifications