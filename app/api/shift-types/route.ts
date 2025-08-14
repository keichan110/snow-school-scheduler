import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const shiftTypes = await prisma.shiftType.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: shiftTypes,
      count: shiftTypes.length,
      message: null,
      error: null
    })
  } catch (error) {
    console.error('ShiftTypes API error:', error)
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, isActive = true } = body

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: 'Validation failed'
        },
        { status: 400 }
      )
    }

    const shiftType = await prisma.shiftType.create({
      data: {
        name,
        isActive
      }
    })

    return NextResponse.json(
      shiftType,
      { status: 201 }
    )
  } catch (error) {
    console.error('ShiftTypes POST API error:', error)
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