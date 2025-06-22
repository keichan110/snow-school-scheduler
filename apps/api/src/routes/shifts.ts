import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { validator } from 'hono/validator'

type Bindings = {
  DB: D1Database
}

const shifts = new Hono<{ Bindings: Bindings }>()

const createValidator = validator('json', (value, c) => {
  const { date, departmentId, shiftTypeId, requiredCount, description } = value
  
  if (!date || isNaN(Date.parse(date))) {
    return c.json({ error: 'date is required and must be a valid date' }, 400)
  }
  if (!departmentId || typeof departmentId !== 'string') {
    return c.json({ error: 'departmentId is required and must be string' }, 400)
  }
  if (!shiftTypeId || typeof shiftTypeId !== 'string') {
    return c.json({ error: 'shiftTypeId is required and must be string' }, 400)
  }
  if (!requiredCount || typeof requiredCount !== 'number' || requiredCount < 1) {
    return c.json({ error: 'requiredCount is required and must be a positive number' }, 400)
  }
  
  return value
})

const assignValidator = validator('json', (value, c) => {
  const { instructorIds } = value
  
  if (!Array.isArray(instructorIds)) {
    return c.json({ error: 'instructorIds is required and must be an array' }, 400)
  }
  
  if (instructorIds.some(id => typeof id !== 'string')) {
    return c.json({ error: 'All instructorIds must be strings' }, 400)
  }
  
  return value
})

shifts.get('/', async (c) => {
  const prisma = new PrismaClient()
  try {
    const departmentId = c.req.query('departmentId')
    const shiftTypeId = c.req.query('shiftTypeId')
    const dateFrom = c.req.query('dateFrom')
    const dateTo = c.req.query('dateTo')
    
    const where: any = {}
    if (departmentId) where.departmentId = departmentId
    if (shiftTypeId) where.shiftTypeId = shiftTypeId
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) where.date.gte = new Date(dateFrom)
      if (dateTo) where.date.lte = new Date(dateTo)
    }
    
    const result = await prisma.shift.findMany({
      where,
      include: {
        department: true,
        shiftType: true,
        assignments: {
          include: {
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
        }
      },
      orderBy: { date: 'asc' }
    })
    
    const resultWithStats = result.map(shift => ({
      ...shift,
      assignedCount: shift.assignments.length,
      remainingCount: shift.requiredCount - shift.assignments.length,
      isFullyAssigned: shift.assignments.length >= shift.requiredCount
    }))
    
    return c.json({
      success: true,
      data: resultWithStats,
      count: resultWithStats.length
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch shifts'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

shifts.get('/:id', async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    const result = await prisma.shift.findUnique({
      where: { id },
      include: {
        department: true,
        shiftType: true,
        assignments: {
          include: {
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
        }
      }
    })
    
    if (!result) {
      return c.json({
        success: false,
        error: 'Shift not found'
      }, 404)
    }
    
    const resultWithStats = {
      ...result,
      assignedCount: result.assignments.length,
      remainingCount: result.requiredCount - result.assignments.length,
      isFullyAssigned: result.assignments.length >= result.requiredCount
    }
    
    return c.json({
      success: true,
      data: resultWithStats
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch shift'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

shifts.post('/', createValidator, async (c) => {
  const prisma = new PrismaClient()
  try {
    const body = c.req.valid('json')
    const { date, departmentId, shiftTypeId, requiredCount, description } = body
    
    const result = await prisma.shift.create({
      data: {
        date: new Date(date),
        departmentId,
        shiftTypeId,
        requiredCount,
        description
      },
      include: {
        department: true,
        shiftType: true,
        assignments: {
          include: {
            instructor: true
          }
        }
      }
    })
    
    const resultWithStats = {
      ...result,
      assignedCount: result.assignments.length,
      remainingCount: result.requiredCount - result.assignments.length,
      isFullyAssigned: result.assignments.length >= result.requiredCount
    }
    
    return c.json({
      success: true,
      data: resultWithStats,
      message: 'Shift created successfully'
    }, 201)
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to create shift'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

shifts.put('/:id', createValidator, async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    const body = c.req.valid('json')
    const { date, departmentId, shiftTypeId, requiredCount, description } = body
    
    const result = await prisma.shift.update({
      where: { id },
      data: {
        date: new Date(date),
        departmentId,
        shiftTypeId,
        requiredCount,
        description
      },
      include: {
        department: true,
        shiftType: true,
        assignments: {
          include: {
            instructor: true
          }
        }
      }
    })
    
    const resultWithStats = {
      ...result,
      assignedCount: result.assignments.length,
      remainingCount: result.requiredCount - result.assignments.length,
      isFullyAssigned: result.assignments.length >= result.requiredCount
    }
    
    return c.json({
      success: true,
      data: resultWithStats,
      message: 'Shift updated successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to update shift'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

shifts.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    await prisma.shift.delete({
      where: { id }
    })
    
    return c.json({
      success: true,
      message: 'Shift deleted successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to delete shift'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

shifts.get('/:id/assign', async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    const shift = await prisma.shift.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
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
        }
      }
    })
    
    if (!shift) {
      return c.json({
        success: false,
        error: 'Shift not found'
      }, 404)
    }
    
    return c.json({
      success: true,
      data: {
        shiftId: shift.id,
        assignments: shift.assignments,
        assignedCount: shift.assignments.length,
        remainingCount: shift.requiredCount - shift.assignments.length,
        isFullyAssigned: shift.assignments.length >= shift.requiredCount
      }
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

shifts.put('/:id/assign', assignValidator, async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    const body = c.req.valid('json')
    const { instructorIds } = body
    
    const shift = await prisma.shift.findUnique({
      where: { id },
      include: { assignments: true }
    })
    
    if (!shift) {
      return c.json({
        success: false,
        error: 'Shift not found'
      }, 404)
    }
    
    if (instructorIds.length > shift.requiredCount) {
      return c.json({
        success: false,
        error: `Cannot assign ${instructorIds.length} instructors to a shift that requires only ${shift.requiredCount}`
      }, 400)
    }
    
    const instructors = await prisma.instructor.findMany({
      where: {
        id: { in: instructorIds },
        status: 'ACTIVE'
      }
    })
    
    const activeInstructorIds = instructors.map((i: any) => i.id)
    const inactiveIds = instructorIds.filter((id: string) => !activeInstructorIds.includes(id))
    
    if (inactiveIds.length > 0) {
      return c.json({
        success: false,
        error: `Instructors not found or inactive: ${inactiveIds.join(', ')}`
      }, 400)
    }
    
    const currentAssignmentIds = shift.assignments.map((a: any) => a.instructorId)
    const added = instructorIds.filter((id: string) => !currentAssignmentIds.includes(id))
    const removed = currentAssignmentIds.filter((id: string) => !instructorIds.includes(id))
    const unchanged = instructorIds.filter((id: string) => currentAssignmentIds.includes(id))
    
    await prisma.$transaction(async (tx) => {
      if (removed.length > 0) {
        await tx.shiftAssignment.deleteMany({
          where: {
            shiftId: id,
            instructorId: { in: removed }
          }
        })
      }
      
      if (added.length > 0) {
        await tx.shiftAssignment.createMany({
          data: added.map((instructorId: string) => ({
            shiftId: id,
            instructorId
          }))
        })
      }
    })
    
    const updatedShift = await prisma.shift.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
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
        }
      }
    })
    
    return c.json({
      success: true,
      data: {
        added,
        removed,
        unchanged,
        current: instructorIds,
        assignments: updatedShift?.assignments || [],
        assignedCount: instructorIds.length,
        remainingCount: shift.requiredCount - instructorIds.length,
        isFullyAssigned: instructorIds.length >= shift.requiredCount
      },
      message: 'Shift assignments updated successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to update shift assignments'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

export default shifts