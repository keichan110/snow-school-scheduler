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
    const departments = await prisma.department.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: departments,
      count: departments.length,
      message: null,
      error: null,
    });
  } catch (error) {
    console.error('Departments API error:', error);
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
