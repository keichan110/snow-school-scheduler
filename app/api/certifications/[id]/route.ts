import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    // IDが数値でない場合は404を返す
    const certificationId = parseInt(id, 10);
    if (isNaN(certificationId)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: 'Resource not found',
        },
        { status: 404 }
      );
    }

    const certification = await prisma.certification.findUnique({
      where: { id: certificationId },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        instructorCertifications: {
          include: {
            instructor: {
              select: {
                id: true,
                lastName: true,
                firstName: true,
                status: true,
              },
            },
          },
        },
      },
    });

    // 資格が見つからない場合は404を返す
    if (!certification) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: 'Resource not found',
        },
        { status: 404 }
      );
    }

    // レスポンス形式をCertificationDetailスキーマに合わせて変換
    const { instructorCertifications, ...certificationBase } = certification;
    const certificationDetail = {
      ...certificationBase,
      instructors: instructorCertifications.map((ic) => ic.instructor),
    };

    return NextResponse.json({
      success: true,
      data: certificationDetail,
      message: null,
      error: null,
    });
  } catch (error) {
    console.error('Certification API error:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: null,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    // IDが数値でない場合は404を返す
    const certificationId = parseInt(id, 10);
    if (isNaN(certificationId)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: 'Resource not found',
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    // 必須フィールドのバリデーション
    const requiredFields = ['departmentId', 'name', 'shortName', 'organization'];
    const missingFields = requiredFields.filter((field) => !(field in body));

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 資格更新
    const certification = await prisma.certification.update({
      where: { id: certificationId },
      data: {
        departmentId: body.departmentId,
        name: body.name,
        shortName: body.shortName,
        organization: body.organization,
        description: body.description,
        isActive: body.isActive ?? true,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: certification,
      message: 'Certification updated successfully',
      error: null,
    });
  } catch (error: unknown) {
    console.error('Certification API error:', error);

    // Prismaの "Record to update not found" エラーを404として処理
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: 'Resource not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        data: null,
        message: null,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
