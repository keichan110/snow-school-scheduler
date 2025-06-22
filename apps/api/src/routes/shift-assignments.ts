import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { validator } from 'hono/validator'

type Bindings = {
  DB: D1Database
}

const shiftAssignments = new Hono<{ Bindings: Bindings }>()

const createValidator = validator('json', (value, c) => {
  const { shiftId, instructorId } = value
  
  if (!shiftId || typeof shiftId !== 'string') {
    return c.json({ error: 'shiftId is required and must be string' }, 400)
  }
  if (!instructorId || typeof instructorId !== 'string') {
    return c.json({ error: 'instructorId is required and must be string' }, 400)
  }
  
  return value
})

shiftAssignments.get('/', async (c) => {
  const prisma = new PrismaClient()
  try {
    const shiftId = c.req.query('shiftId')
    const instructorId = c.req.query('instructorId')
    const dateFrom = c.req.query('dateFrom')
    const dateTo = c.req.query('dateTo')
    
    const where: any = {}
    if (shiftId) where.shiftId = shiftId
    if (instructorId) where.instructorId = instructorId
    
    let shiftWhere: any = {}
    if (dateFrom || dateTo) {
      shiftWhere.date = {}
      if (dateFrom) shiftWhere.date.gte = new Date(dateFrom)
      if (dateTo) shiftWhere.date.lte = new Date(dateTo)
    }
    
    const result = await prisma.shiftAssignment.findMany({
      where: {
        ...where,
        ...(Object.keys(shiftWhere).length > 0 && {
          shift: shiftWhere
        })
      },
      include: {
        shift: {
          include: {
            department: true,
            shiftType: true
          }
        },
        instructor: {
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
        }
      },
      orderBy: [
        { shift: { date: 'asc' } },
        { assignedAt: 'asc' }
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
      error: 'Failed to fetch shift assignments'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

shiftAssignments.get('/:id', async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    const result = await prisma.shiftAssignment.findUnique({
      where: { id },
      include: {
        shift: {
          include: {
            department: true,
            shiftType: true,
            assignments: {
              include: {
                instructor: true
              }
            }
          }
        },
        instructor: {
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
        }
      }
    })
    
    if (!result) {
      return c.json({
        success: false,
        error: 'Shift assignment not found'
      }, 404)
    }
    
    return c.json({
      success: true,
      data: result
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch shift assignment'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

shiftAssignments.post('/', createValidator, async (c) => {
  const prisma = new PrismaClient()
  try {
    const body = c.req.valid('json')
    const { shiftId, instructorId } = body
    
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: { assignments: true }
    })
    
    if (!shift) {
      return c.json({
        success: false,
        error: 'Shift not found'
      }, 404)
    }
    
    if (shift.assignments.length >= shift.requiredCount) {
      return c.json({
        success: false,
        error: 'Shift is already fully assigned'
      }, 409)
    }
    
    const instructor = await prisma.instructor.findUnique({
      where: { id: instructorId }
    })
    
    if (!instructor) {
      return c.json({
        success: false,
        error: 'Instructor not found'
      }, 404)
    }
    
    if (instructor.status !== 'ACTIVE') {
      return c.json({
        success: false,
        error: 'Instructor is not active'
      }, 409)
    }
    
    const result = await prisma.shiftAssignment.create({
      data: {
        shiftId,
        instructorId
      },
      include: {
        shift: {
          include: {
            department: true,
            shiftType: true
          }
        },
        instructor: {
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
        }
      }
    })
    
    return c.json({
      success: true,
      data: result,
      message: 'Shift assignment created successfully'
    }, 201)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return c.json({
        success: false,
        error: 'This instructor is already assigned to this shift'
      }, 409)
    }
    
    return c.json({
      success: false,
      error: 'Failed to create shift assignment'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

shiftAssignments.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    await prisma.shiftAssignment.delete({
      where: { id }
    })
    
    return c.json({
      success: true,
      message: 'Shift assignment deleted successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to delete shift assignment'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

export default shiftAssignments