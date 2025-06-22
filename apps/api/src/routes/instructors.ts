import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { validator } from 'hono/validator'

type Bindings = {
  DB: D1Database
}

const instructors = new Hono<{ Bindings: Bindings }>()

const createInstructorValidator = validator('json', (value, c) => {
  const { lastName, firstName, lastNameKana, firstNameKana, status, notes } = value
  
  if (!lastName || typeof lastName !== 'string') {
    return c.json({ error: 'lastName is required and must be string' }, 400)
  }
  if (!firstName || typeof firstName !== 'string') {
    return c.json({ error: 'firstName is required and must be string' }, 400)
  }
  if (status && !['ACTIVE', 'INACTIVE', 'RETIRED'].includes(status)) {
    return c.json({ error: 'status must be ACTIVE, INACTIVE, or RETIRED' }, 400)
  }
  
  return value
})

instructors.get('/', async (c) => {
  const prisma = new PrismaClient()
  try {
    const status = c.req.query('status')
    const where = status ? { status } : {}
    
    const result = await prisma.instructor.findMany({
      where,
      include: {
        certifications: {
          include: {
            certification: {
              include: {
                department: true
              }
            }
          }
        },
        shiftAssignments: {
          include: {
            shift: {
              include: {
                department: true,
                shiftType: true
              }
            }
          }
        }
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    })
    
    return c.json({
      success: true,
      data: result,
      count: result.length
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch instructors'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

instructors.get('/:id', async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    const result = await prisma.instructor.findUnique({
      where: { id },
      include: {
        certifications: {
          include: {
            certification: {
              include: {
                department: true
              }
            }
          }
        },
        shiftAssignments: {
          include: {
            shift: {
              include: {
                department: true,
                shiftType: true
              }
            }
          }
        }
      }
    })
    
    if (!result) {
      return c.json({
        success: false,
        error: 'Instructor not found'
      }, 404)
    }
    
    return c.json({
      success: true,
      data: result
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch instructor'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

instructors.post('/', createInstructorValidator, async (c) => {
  const prisma = new PrismaClient()
  try {
    const body = c.req.valid('json')
    const { lastName, firstName, lastNameKana, firstNameKana, status, notes } = body
    
    const result = await prisma.instructor.create({
      data: {
        lastName,
        firstName,
        lastNameKana,
        firstNameKana,
        status: status || 'ACTIVE',
        notes
      },
      include: {
        certifications: {
          include: {
            certification: {
              include: {
                department: true
              }
            }
          }
        }
      }
    })
    
    return c.json({
      success: true,
      data: result,
      message: 'Instructor created successfully'
    }, 201)
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to create instructor'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

instructors.put('/:id', createInstructorValidator, async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    const body = c.req.valid('json')
    const { lastName, firstName, lastNameKana, firstNameKana, status, notes } = body
    
    const result = await prisma.instructor.update({
      where: { id },
      data: {
        lastName,
        firstName,
        lastNameKana,
        firstNameKana,
        status,
        notes
      },
      include: {
        certifications: {
          include: {
            certification: {
              include: {
                department: true
              }
            }
          }
        }
      }
    })
    
    return c.json({
      success: true,
      data: result,
      message: 'Instructor updated successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to update instructor'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

instructors.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    await prisma.instructor.delete({
      where: { id }
    })
    
    return c.json({
      success: true,
      message: 'Instructor deleted successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to delete instructor'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

export default instructors