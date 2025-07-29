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
      certifications: instructor.certifications.map((ic) => ({
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // 必須フィールドのバリデーション
    const requiredFields = ['lastName', 'firstName']
    const missingFields = requiredFields.filter(field => !(field in body))
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: `Missing required fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      )
    }

    // statusのバリデーション
    if (body.status && !['ACTIVE', 'INACTIVE', 'RETIRED'].includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: 'Invalid status value'
        },
        { status: 400 }
      )
    }

    // 資格IDの存在確認（指定されている場合）
    if (body.certificationIds && Array.isArray(body.certificationIds)) {
      const existingCertifications = await prisma.certification.findMany({
        where: {
          id: { in: body.certificationIds },
          isActive: true
        }
      })
      
      if (existingCertifications.length !== body.certificationIds.length) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            message: null,
            error: 'Some certification IDs are invalid or inactive'
          },
          { status: 400 }
        )
      }
    }

    // トランザクション処理でインストラクターと資格の関連付けを作成
    const result = await prisma.$transaction(async (tx) => {
      // インストラクター作成
      const newInstructor = await tx.instructor.create({
        data: {
          lastName: body.lastName,
          firstName: body.firstName,
          lastNameKana: body.lastNameKana,
          firstNameKana: body.firstNameKana,
          status: body.status || 'ACTIVE',
          notes: body.notes
        }
      })

      // 資格の関連付け（指定されている場合）
      if (body.certificationIds && Array.isArray(body.certificationIds)) {
        await tx.instructorCertification.createMany({
          data: body.certificationIds.map((certId: number) => ({
            instructorId: newInstructor.id,
            certificationId: certId
          }))
        })
      }

      // 関連データ付きでインストラクターを取得
      const instructorWithCertifications = await tx.instructor.findUnique({
        where: { id: newInstructor.id },
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
        }
      })

      return instructorWithCertifications
    })

    // レスポンス形式をOpenAPI仕様に合わせて変換
    const formattedInstructor = {
      id: result!.id,
      lastName: result!.lastName,
      firstName: result!.firstName,
      lastNameKana: result!.lastNameKana,
      firstNameKana: result!.firstNameKana,
      status: result!.status,
      notes: result!.notes,
      createdAt: result!.createdAt,
      updatedAt: result!.updatedAt,
      certifications: result!.certifications.map((ic) => ({
        id: ic.certification.id,
        name: ic.certification.name,
        shortName: ic.certification.shortName,
        organization: ic.certification.organization,
        department: ic.certification.department
      }))
    }

    return NextResponse.json(
      {
        success: true,
        data: formattedInstructor,
        message: 'Instructor operation completed successfully',
        error: null
      },
      { status: 201 }
    )
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