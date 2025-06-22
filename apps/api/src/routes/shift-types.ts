import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { validator } from 'hono/validator'

type Bindings = {
  DB: D1Database
}

const shiftTypes = new Hono<{ Bindings: Bindings }>()

const createValidator = validator('json', (value, c) => {
  const { name, isActive } = value
  
  if (!name || typeof name !== 'string') {
    return c.json({ error: 'name is required and must be string' }, 400)
  }
  
  return value
})

shiftTypes.get('/', async (c) => {
  const prisma = new PrismaClient()
  try {
    const isActive = c.req.query('isActive')
    const where = isActive ? { isActive: isActive === 'true' } : {}
    
    const result = await prisma.shiftType.findMany({
      where,
      include: {
        shifts: {
          include: {
            department: true,
            assignments: {
              include: {
                instructor: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    return c.json({
      success: true,
      data: result,
      count: result.length
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch shift types'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

shiftTypes.get('/:id', async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    const result = await prisma.shiftType.findUnique({
      where: { id },
      include: {
        shifts: {
          include: {
            department: true,
            assignments: {
              include: {
                instructor: true
              }
            }
          }
        }
      }
    })
    
    if (!result) {
      return c.json({
        success: false,
        error: 'Shift type not found'
      }, 404)
    }
    
    return c.json({
      success: true,
      data: result
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch shift type'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

shiftTypes.post('/', createValidator, async (c) => {
  const prisma = new PrismaClient()
  try {
    const body = c.req.valid('json')
    const { name, isActive } = body
    
    const result = await prisma.shiftType.create({
      data: {
        name,
        isActive: isActive ?? true
      }
    })
    
    return c.json({
      success: true,
      data: result,
      message: 'Shift type created successfully'
    }, 201)
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to create shift type'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

shiftTypes.put('/:id', createValidator, async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    const body = c.req.valid('json')
    const { name, isActive } = body
    
    const result = await prisma.shiftType.update({
      where: { id },
      data: {
        name,
        isActive
      }
    })
    
    return c.json({
      success: true,
      data: result,
      message: 'Shift type updated successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to update shift type'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

shiftTypes.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    await prisma.shiftType.delete({
      where: { id }
    })
    
    return c.json({
      success: true,
      message: 'Shift type deleted successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to delete shift type'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

export default shiftTypes