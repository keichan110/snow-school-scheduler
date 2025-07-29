import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { InstructorStatus } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')
    
    // statusパラメータのバリデーション
    let statusFilter: InstructorStatus | undefined = undefined
    if (statusParam) {
      const validStatuses = ['ACTIVE', 'INACTIVE', 'RETIRED'] as const
      if (validStatuses.includes(statusParam as InstructorStatus)) {
        statusFilter = statusParam as InstructorStatus
      }
    }

    const whereClause = statusFilter ? { status: statusFilter } : {}
    
    const instructors = await prisma.instructor.findMany({
      where: whereClause,
      include: {
        certifications: {
          include: {
            certification: {
              include: {
                department: {
                  select: {
                    id: true,
                    name: true
                  }
                }
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

    // レスポンス形式をOpenAPI仕様に合わせて変換
    const formattedInstructors = instructors.map(instructor => ({
      id: instructor.id,
      lastName: instructor.lastName,
      firstName: instructor.firstName,
      lastNameKana: instructor.lastNameKana,
      firstNameKana: instructor.firstNameKana,
      status: instructor.status,
      notes: instructor.notes,
      createdAt: instructor.createdAt,
      updatedAt: instructor.updatedAt,
      certifications: instructor.certifications.map((ic: any) => ({
        id: ic.certification.id,
        name: ic.certification.name,
        shortName: ic.certification.shortName,
        organization: ic.certification.organization,
        department: ic.certification.department
      }))
    }))

    return NextResponse.json({
      success: true,
      data: formattedInstructors,
      count: formattedInstructors.length,
      message: null,
      error: null
    })
  } catch (error) {
    console.error('Instructors API error:', error)
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
    // TODO: Implement instructor creation
    return NextResponse.json({ 
      success: true,
      data: null,
      message: 'Instructor creation - ready for implementation'
    })
  } catch (error) {
    console.error('Instructors API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}