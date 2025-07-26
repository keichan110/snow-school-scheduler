import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    
    // IDが数値でない場合は404を返す
    const certificationId = parseInt(id, 10)
    if (isNaN(certificationId)) {
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

    const certification = await prisma.certification.findUnique({
      where: { id: certificationId },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            colorPalette: true
          }
        },
        instructorCertifications: {
          include: {
            instructor: {
              select: {
                id: true,
                lastName: true,
                firstName: true,
                status: true
              }
            }
          }
        }
      }
    })

    // 資格が見つからない場合は404を返す
    if (!certification) {
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

    // レスポンス形式をCertificationDetailスキーマに合わせて変換
    const { instructorCertifications, ...certificationBase } = certification
    const certificationDetail = {
      ...certificationBase,
      instructors: instructorCertifications.map(ic => ic.instructor)
    }

    return NextResponse.json({
      success: true,
      data: certificationDetail,
      message: null,
      error: null
    })
  } catch (error) {
    console.error('Certification API error:', error)
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