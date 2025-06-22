import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { validator } from 'hono/validator'

type Bindings = {
  DB: D1Database
}

const instructorCertifications = new Hono<{ Bindings: Bindings }>()

const createValidator = validator('json', (value, c) => {
  const { instructorId, certificationId, expiryDate } = value
  
  if (!instructorId || typeof instructorId !== 'string') {
    return c.json({ error: 'instructorId is required and must be string' }, 400)
  }
  if (!certificationId || typeof certificationId !== 'string') {
    return c.json({ error: 'certificationId is required and must be string' }, 400)
  }
  if (expiryDate && isNaN(Date.parse(expiryDate))) {
    return c.json({ error: 'expiryDate must be a valid date' }, 400)
  }
  
  return value
})

instructorCertifications.get('/', async (c) => {
  const prisma = new PrismaClient()
  try {
    const instructorId = c.req.query('instructorId')
    const certificationId = c.req.query('certificationId')
    
    const where: any = {}
    if (instructorId) where.instructorId = instructorId
    if (certificationId) where.certificationId = certificationId
    
    const result = await prisma.instructorCertification.findMany({
      where,
      include: {
        instructor: true,
        certification: {
          include: {
            department: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return c.json({
      success: true,
      data: result,
      count: result.length
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch instructor certifications'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

instructorCertifications.get('/:id', async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    const result = await prisma.instructorCertification.findUnique({
      where: { id },
      include: {
        instructor: true,
        certification: {
          include: {
            department: true
          }
        }
      }
    })
    
    if (!result) {
      return c.json({
        success: false,
        error: 'Instructor certification not found'
      }, 404)
    }
    
    return c.json({
      success: true,
      data: result
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch instructor certification'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

instructorCertifications.post('/', createValidator, async (c) => {
  const prisma = new PrismaClient()
  try {
    const body = c.req.valid('json')
    const { instructorId, certificationId, expiryDate } = body
    
    const result = await prisma.instructorCertification.create({
      data: {
        instructorId,
        certificationId,
        expiryDate: expiryDate ? new Date(expiryDate) : null
      },
      include: {
        instructor: true,
        certification: {
          include: {
            department: true
          }
        }
      }
    })
    
    return c.json({
      success: true,
      data: result,
      message: 'Instructor certification created successfully'
    }, 201)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return c.json({
        success: false,
        error: 'This instructor already has this certification'
      }, 409)
    }
    
    return c.json({
      success: false,
      error: 'Failed to create instructor certification'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

instructorCertifications.put('/:id', async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    const body = await c.req.json()
    const { expiryDate } = body
    
    if (expiryDate && isNaN(Date.parse(expiryDate))) {
      return c.json({
        success: false,
        error: 'expiryDate must be a valid date'
      }, 400)
    }
    
    const result = await prisma.instructorCertification.update({
      where: { id },
      data: {
        expiryDate: expiryDate ? new Date(expiryDate) : null
      },
      include: {
        instructor: true,
        certification: {
          include: {
            department: true
          }
        }
      }
    })
    
    return c.json({
      success: true,
      data: result,
      message: 'Instructor certification updated successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to update instructor certification'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

instructorCertifications.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient()
  try {
    await prisma.instructorCertification.delete({
      where: { id }
    })
    
    return c.json({
      success: true,
      message: 'Instructor certification deleted successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to delete instructor certification'
    }, 500)
  } finally {
    await prisma.$disconnect()
  }
})

export default instructorCertifications