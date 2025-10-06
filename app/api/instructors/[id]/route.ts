import { type NextRequest, NextResponse } from "next/server";
import { authenticateFromRequest } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // IDのバリデーション
    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId) || numericId <= 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: "Invalid ID format",
        },
        { status: 400 }
      );
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
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // インストラクターが見つからない場合
    if (!instructor) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: "Resource not found",
        },
        { status: 404 }
      );
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
        department: ic.certification.department,
      })),
    };

    return NextResponse.json({
      success: true,
      data: formattedInstructor,
      message: "Instructor operation completed successfully",
      error: null,
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: null,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authenticateFromRequest(request);
  if (!authResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Authentication required",
        data: null,
        message: null,
      },
      { status: 401 }
    );
  }
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // IDのバリデーション
    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId) || numericId <= 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: "Invalid ID format",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // 必須フィールドのバリデーション
    const requiredFields = ["lastName", "firstName"];
    const missingFields = requiredFields.filter((field) => !(field in body));

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // statusのバリデーション
    if (
      body.status &&
      !["ACTIVE", "INACTIVE", "RETIRED"].includes(body.status)
    ) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: "Invalid status value",
        },
        { status: 400 }
      );
    }

    // インストラクターの存在確認
    const existingInstructor = await prisma.instructor.findUnique({
      where: { id: numericId },
    });

    if (!existingInstructor) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: "Resource not found",
        },
        { status: 404 }
      );
    }

    // 資格IDの存在確認（指定されている場合）
    if (body.certificationIds && Array.isArray(body.certificationIds)) {
      const existingCertifications = await prisma.certification.findMany({
        where: {
          id: { in: body.certificationIds },
          isActive: true,
        },
      });

      if (existingCertifications.length !== body.certificationIds.length) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            message: null,
            error: "Some certification IDs are invalid or inactive",
          },
          { status: 400 }
        );
      }
    }

    // トランザクション処理でインストラクターと資格の関連付けを更新
    const result = await prisma.$transaction(async (tx) => {
      // インストラクター更新
      await tx.instructor.update({
        where: { id: numericId },
        data: {
          lastName: body.lastName,
          firstName: body.firstName,
          lastNameKana: body.lastNameKana,
          firstNameKana: body.firstNameKana,
          status: body.status || existingInstructor.status,
          notes: body.notes,
        },
      });

      // 資格の関連付け更新（指定されている場合）
      if (body.certificationIds && Array.isArray(body.certificationIds)) {
        // 既存の資格関連付けを削除
        await tx.instructorCertification.deleteMany({
          where: { instructorId: numericId },
        });

        // 新しい資格関連付けを作成
        if (body.certificationIds.length > 0) {
          await tx.instructorCertification.createMany({
            data: body.certificationIds.map((certId: number) => ({
              instructorId: numericId,
              certificationId: certId,
            })),
          });
        }
      }

      // 関連データ付きでインストラクターを取得
      const instructorWithCertifications = await tx.instructor.findUnique({
        where: { id: numericId },
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
      id: result?.id,
      lastName: result?.lastName,
      firstName: result?.firstName,
      lastNameKana: result?.lastNameKana,
      firstNameKana: result?.firstNameKana,
      status: result?.status,
      notes: result?.notes,
      createdAt: result?.createdAt,
      updatedAt: result?.updatedAt,
      certifications: result?.certifications.map((ic) => ({
        id: ic.certification.id,
        name: ic.certification.name,
        shortName: ic.certification.shortName,
        organization: ic.certification.organization,
        department: ic.certification.department,
      })),
    };

    return NextResponse.json({
      success: true,
      data: formattedInstructor,
      message: "Instructor operation completed successfully",
      error: null,
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: null,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
