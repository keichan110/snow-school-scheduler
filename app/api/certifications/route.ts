import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateFromRequest } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  const authResult = await authenticateFromRequest(request);
  if (!authResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication required',
        data: null,
        message: null,
      },
      { status: 401 }
    );
  }
  try {
    const certifications = await prisma.certification.findMany({
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ department: { name: 'asc' } }, { name: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      data: certifications,
      count: certifications.length,
      message: null,
      error: null,
    });
  } catch (error) {
    console.error('Certifications API error:', error);
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

export async function POST(request: NextRequest) {
  const authResult = await authenticateFromRequest(request);
  if (!authResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication required',
        data: null,
        message: null,
      },
      { status: 401 }
    );
  }

  try {
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

    // 資格作成
    const certification = await prisma.certification.create({
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

    return NextResponse.json(
      {
        success: true,
        data: certification,
        message: 'Certification created successfully',
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Certifications API error:', error);
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
