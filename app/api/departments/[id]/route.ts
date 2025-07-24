import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // パラメータを解決
    const resolvedParams = await params
    
    // IDパラメータの検証
    const id = parseInt(resolvedParams.id, 10)
    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: 'Resource not found',
        },
        { status: 404 }
      )
    }

    // 部門詳細を取得
    const department = await prisma.department.findUnique({
      where: { id },
    })

    // 部門が存在しない場合
    if (!department) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: 'Resource not found',
        },
        { status: 404 }
      )
    }

    // 成功レスポンス
    return NextResponse.json({
      success: true,
      data: department,
      message: null,
      error: null,
    })
  } catch (error) {
    console.error('Department detail API error:', error)
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: null,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}