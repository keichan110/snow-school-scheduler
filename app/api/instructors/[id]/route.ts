import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id
    
    // IDのバリデーション
    const numericId = parseInt(id, 10)
    if (isNaN(numericId) || numericId <= 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: 'Invalid ID format'
        },
        { status: 400 }
      )
    }

    // インストラクター詳細情報を取得
    const instructor = await prisma.instructor.findUnique({
      where: { id: numericId },
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

    // インストラクターが見つからない場合
    if (!instructor) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: 'Resource not found'
        },
        { status: 404 }
      )
    }

    // レスポンス形式をOpenAPI仕様に合わせて変換
    const formattedInstructor = {
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
    }

    return NextResponse.json({
      success: true,
      data: formattedInstructor,
      message: 'Instructor operation completed successfully',
      error: null
    })
  } catch (error) {
    console.error('Instructor API error:', error)
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