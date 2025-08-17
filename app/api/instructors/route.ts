// NextResponse import removed as it's only used in return type
import { prisma } from '@/lib/db';
import { InstructorStatus } from '@prisma/client';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  withApiErrorHandling,
} from '@/lib/api/response';
import { isOneOf, validate, commonSchemas } from '@/lib/api/validation';
import { ApiErrorType, HttpStatus, ApiSuccessResponse, ApiErrorResponse } from '@/lib/api/types';

export async function GET(request: Request) {
  return withApiErrorHandling<ApiSuccessResponse<unknown[]> | ApiErrorResponse>(async () => {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const departmentIdParam = searchParams.get('departmentId');

    // statusパラメータのバリデーション
    let statusFilter: InstructorStatus | undefined = undefined;
    if (statusParam) {
      const statusErrors = isOneOf(['ACTIVE', 'INACTIVE', 'RETIRED'])(statusParam, 'status');
      if (statusErrors.length > 0) {
        return createValidationErrorResponse(statusErrors);
      }
      statusFilter = statusParam as InstructorStatus;
    }

    // departmentIdパラメータのバリデーション
    let departmentIdFilter: number | undefined = undefined;
    if (departmentIdParam) {
      const departmentId = parseInt(departmentIdParam, 10);
      if (isNaN(departmentId) || departmentId <= 0) {
        return createValidationErrorResponse([
          {
            field: 'departmentId',
            message: 'departmentId must be a positive integer',
          },
        ]);
      }
      departmentIdFilter = departmentId;
    }

    const whereClause: Record<string, unknown> = {};
    if (statusFilter) {
      whereClause.status = statusFilter;
    }
    if (departmentIdFilter) {
      whereClause.certifications = {
        some: {
          certification: {
            departmentId: departmentIdFilter,
          },
        },
      };
    }

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
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    // レスポンス形式をOpenAPI仕様に合わせて変換
    const formattedInstructors = instructors.map((instructor) => ({
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
        department: ic.certification.department,
      })),
    }));

    return createSuccessResponse(formattedInstructors, {
      count: formattedInstructors.length,
    });
  }, 'GET /api/instructors');
}

export async function POST(request: Request) {
  return withApiErrorHandling<ApiSuccessResponse<unknown> | ApiErrorResponse>(async () => {
    const body = await request.json();

    // スキーマベースバリデーション
    const schema = commonSchemas.createInstructor;
    if (!schema) {
      return createErrorResponse('Validation schema not found', {
        type: ApiErrorType.INTERNAL_ERROR,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
    const validationResult = validate(body, schema);
    if (!validationResult.isValid) {
      return createValidationErrorResponse(validationResult.errors);
    }

    // 資格IDの存在確認（指定されている場合）
    if (body.certificationIds && Array.isArray(body.certificationIds)) {
      const existingCertifications = await prisma.certification.findMany({
        where: {
          id: { in: body.certificationIds || [] },
          isActive: true,
        },
      });

      const certificationIdsLength = body?.certificationIds?.length ?? 0;
      if ((existingCertifications?.length ?? 0) !== certificationIdsLength) {
        return createErrorResponse('Some certification IDs are invalid or inactive', {
          type: ApiErrorType.VALIDATION_ERROR,
          status: HttpStatus.BAD_REQUEST,
        });
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
          notes: body.notes,
        },
      });

      // 資格の関連付け（指定されている場合）
      if (body.certificationIds && Array.isArray(body.certificationIds)) {
        await tx.instructorCertification.createMany({
          data: body.certificationIds.map((certId: number) => ({
            instructorId: newInstructor.id,
            certificationId: certId,
          })),
        });
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
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return instructorWithCertifications;
    });

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
        department: ic.certification.department,
      })),
    };

    return createSuccessResponse(formattedInstructor, {
      status: HttpStatus.CREATED,
      message: 'Instructor operation completed successfully',
    });
  }, 'POST /api/instructors');
}
