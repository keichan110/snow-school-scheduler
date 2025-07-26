import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const certifications = await prisma.certification.findMany({
      include: {
        department: {
          select: {
            id: true,
            name: true,
            colorPalette: true
          }
        }
      },
      orderBy: [
        { department: { name: 'asc' } },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: certifications,
      count: certifications.length,
      message: null,
      error: null
    })
  } catch (error) {
    console.error('Certifications API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        data: null,
        message: null,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    // TODO: Implement certification creation
    return NextResponse.json({ 
      success: true,
      data: null,
      message: 'Certification creation - ready for implementation'
    })
  } catch (error) {
    console.error('Certifications API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}