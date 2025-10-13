import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("スキー・スノーボードスクール 初期データ投入開始...\n");

  // 既存データをクリア（開発用）
  console.log("既存データをクリア中...");
  await prisma.shiftAssignment.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.instructorCertification.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.shiftType.deleteMany();
  await prisma.department.deleteMany();

  // ============================================
  // 1. 部門データ（マスタ）
  // ============================================
  console.log("部門データを作成中...");

  const skiDepartment = await prisma.department.create({
    data: {
      code: "ski",
      name: "スキー",
      description: "スキー部門",
    },
  });

  const snowboardDepartment = await prisma.department.create({
    data: {
      code: "snowboard",
      name: "スノーボード",
      description: "スノーボード部門",
    },
  });

  console.log(`部門: ${skiDepartment.name}, ${snowboardDepartment.name}`);

  // ============================================
  // 2. シフト種類データ（マスタ）
  // ============================================
  console.log("シフト種類を作成中...");

  const generalLessonType = await prisma.shiftType.create({
    data: { name: "一般レッスン" },
  });

  const groupLessonType = await prisma.shiftType.create({
    data: { name: "団体レッスン" },
  });

  const badgeTestType = await prisma.shiftType.create({
    data: { name: "バッジテスト" },
  });

  const prefectureEventType = await prisma.shiftType.create({
    data: { name: "県連事業" },
  });

  console.log(
    `シフト種類: ${generalLessonType.name}, ${groupLessonType.name}, ${badgeTestType.name}, ${prefectureEventType.name}`
  );

  // ============================================
  // 3. 資格データ（マスタ）
  // ============================================
  console.log("資格データを作成中...");

  // スキー資格
  const skiCertifications = await Promise.all([
    prisma.certification.create({
      data: {
        departmentId: skiDepartment.id,
        name: "功労スキー指導員",
        shortName: "功労指導員",
        organization: "SAJ",
        description: "",
      },
    }),
    prisma.certification.create({
      data: {
        departmentId: skiDepartment.id,
        name: "功労スキー準指導員",
        shortName: "功労準指導員",
        organization: "SAJ",
        description: "",
      },
    }),
    prisma.certification.create({
      data: {
        departmentId: skiDepartment.id,
        name: "公認スキー指導員",
        shortName: "指導員",
        organization: "SAJ",
        description: "",
      },
    }),
    prisma.certification.create({
      data: {
        departmentId: skiDepartment.id,
        name: "認定スキー指導員",
        shortName: "認定指導員",
        organization: "SAS",
        description: "",
      },
    }),
    prisma.certification.create({
      data: {
        departmentId: skiDepartment.id,
        name: "名誉スキー検定員",
        shortName: "名誉検定員",
        organization: "SAJ",
        description: "",
      },
    }),
    prisma.certification.create({
      data: {
        departmentId: skiDepartment.id,
        name: "公認スキーA級検定員",
        shortName: "A級検定員",
        organization: "SAJ",
        description: "",
      },
    }),
    prisma.certification.create({
      data: {
        departmentId: skiDepartment.id,
        name: "公認スキーB級検定員",
        shortName: "B級検定員",
        organization: "SAJ",
        description: "",
      },
    }),
    prisma.certification.create({
      data: {
        departmentId: skiDepartment.id,
        name: "公認スキーC級検定員",
        shortName: "C級検定員",
        organization: "SAJ",
        description: "",
      },
    }),
  ]);

  // スノーボード資格
  const snowboardCertifications = await Promise.all([
    prisma.certification.create({
      data: {
        departmentId: snowboardDepartment.id,
        name: "功労スノーボード指導員",
        shortName: "功労指導員",
        organization: "SAJ",
        description: "",
      },
    }),
    prisma.certification.create({
      data: {
        departmentId: snowboardDepartment.id,
        name: "功労スノーボード準指導員",
        shortName: "功労準指導員",
        organization: "SAJ",
        description: "",
      },
    }),
    prisma.certification.create({
      data: {
        departmentId: snowboardDepartment.id,
        name: "公認スノーボード指導員",
        shortName: "指導員",
        organization: "SAJ",
        description: "",
      },
    }),
    prisma.certification.create({
      data: {
        departmentId: snowboardDepartment.id,
        name: "公認スノーボード準指導員",
        shortName: "準指導員",
        organization: "SAJ",
        description: "",
      },
    }),
    prisma.certification.create({
      data: {
        departmentId: snowboardDepartment.id,
        name: "認定スノーボード指導員",
        shortName: "認定指導員",
        organization: "SAS",
        description: "",
      },
    }),
    prisma.certification.create({
      data: {
        departmentId: snowboardDepartment.id,
        name: "公認スノーボードA級検定員",
        shortName: "A級検定員",
        organization: "SAJ",
        description: "",
      },
    }),
    prisma.certification.create({
      data: {
        departmentId: snowboardDepartment.id,
        name: "公認スノーボードB級検定員",
        shortName: "B級検定員",
        organization: "SAJ",
        description: "",
      },
    }),
    prisma.certification.create({
      data: {
        departmentId: snowboardDepartment.id,
        name: "公認スノーボードC級検定員",
        shortName: "C級検定員",
        organization: "SAJ",
        description: "",
      },
    }),
  ]);

  console.log(
    `資格: スキー${skiCertifications.length}件, スノボ${snowboardCertifications.length}件`
  );

  // ============================================
  // 4. インストラクターデータ（多様な資格組み合わせ）
  // ============================================
  console.log("インストラクターデータを作成中...");

  const instructors = await Promise.all([
    // === スキー専門インストラクター ===
    prisma.instructor.create({
      data: {
        lastName: "田中",
        firstName: "太郎",
        lastNameKana: "タナカ",
        firstNameKana: "タロウ",
        status: "ACTIVE",
        notes:
          "スキー指導歴15年のベテラン。基礎技術指導が得意。公認指導員資格保持。",
      },
    }),
    prisma.instructor.create({
      data: {
        lastName: "佐藤",
        firstName: "花子",
        lastNameKana: "サトウ",
        firstNameKana: "ハナコ",
        status: "ACTIVE",
        notes: "元アルペン選手。認定指導員として競技指導を担当。",
      },
    }),
    prisma.instructor.create({
      data: {
        lastName: "鈴木",
        firstName: "一郎",
        lastNameKana: "スズキ",
        firstNameKana: "イチロウ",
        status: "ACTIVE",
        notes: "検定員としてバッジテストを担当。救急法指導員も兼任。",
      },
    }),
    prisma.instructor.create({
      data: {
        lastName: "伊藤",
        firstName: "健二",
        lastNameKana: "イトウ",
        firstNameKana: "ケンジ",
        status: "ACTIVE",
        notes: "B級検定員として初級・中級レッスンを担当。",
      },
    }),
    prisma.instructor.create({
      data: {
        lastName: "加藤",
        firstName: "美穂",
        lastNameKana: "カトウ",
        firstNameKana: "ミホ",
        status: "ACTIVE",
        notes: "C級検定員として基礎レッスンを担当。指導歴5年。",
      },
    }),

    // === スノーボード専門インストラクター ===
    prisma.instructor.create({
      data: {
        lastName: "高橋",
        firstName: "美咲",
        lastNameKana: "タカハシ",
        firstNameKana: "ミサキ",
        status: "ACTIVE",
        notes:
          "スノーボード指導員として基礎〜上級まで幅広く対応。フリースタイル経験あり。",
      },
    }),
    prisma.instructor.create({
      data: {
        lastName: "山田",
        firstName: "健太",
        lastNameKana: "ヤマダ",
        firstNameKana: "ケンタ",
        status: "ACTIVE",
        notes: "A級検定員としてハイレベルなレッスンを担当。元プロライダー。",
      },
    }),
    prisma.instructor.create({
      data: {
        lastName: "小林",
        firstName: "雄一",
        lastNameKana: "コバヤシ",
        firstNameKana: "ユウイチ",
        status: "ACTIVE",
        notes: "準指導員として団体レッスンを担当。パーク指導も可能。",
      },
    }),
    prisma.instructor.create({
      data: {
        lastName: "森",
        firstName: "さくら",
        lastNameKana: "モリ",
        firstNameKana: "サクラ",
        status: "ACTIVE",
        notes: "認定指導員として競技指導を担当。元全日本強化指定選手。",
      },
    }),
    prisma.instructor.create({
      data: {
        lastName: "吉田",
        firstName: "和也",
        lastNameKana: "ヨシダ",
        firstNameKana: "カズヤ",
        status: "ACTIVE",
        notes: "B級検定員として初級・中級レッスンを担当。指導歴8年。",
      },
    }),
    prisma.instructor.create({
      data: {
        lastName: "清水",
        firstName: "麻衣",
        lastNameKana: "シミズ",
        firstNameKana: "マイ",
        status: "ACTIVE",
        notes: "C級検定員として基礎レッスンを担当。新人指導にも対応。",
      },
    }),

    // === スキー・スノーボード両方の資格保持者 ===
    prisma.instructor.create({
      data: {
        lastName: "松本",
        firstName: "大輔",
        lastNameKana: "マツモト",
        firstNameKana: "ダイスケ",
        status: "ACTIVE",
        notes:
          "スキー・スノーボード両方の指導員資格を持つオールラウンダー。20年のキャリア。",
      },
    }),
    prisma.instructor.create({
      data: {
        lastName: "中村",
        firstName: "真理",
        lastNameKana: "ナカムラ",
        firstNameKana: "マリ",
        status: "ACTIVE",
        notes:
          "スキーA級検定員・スノーボード準指導員の二刀流。幅広いレベルに対応可能。",
      },
    }),
    prisma.instructor.create({
      data: {
        lastName: "藤田",
        firstName: "学",
        lastNameKana: "フジタ",
        firstNameKana: "マナブ",
        status: "ACTIVE",
        notes:
          "スキーB級検定員・スノーボードC級検定員として初級〜中級レッスンを担当。",
      },
    }),

    // === 退職・休職者 ===
    prisma.instructor.create({
      data: {
        lastName: "渡辺",
        firstName: "明",
        lastNameKana: "ワタナベ",
        firstNameKana: "アキラ",
        status: "RETIRED",
        notes:
          "昨シーズンで引退。スキー指導歴25年のレジェンド。公認指導員として多くの後輩を指導。",
      },
    }),
    prisma.instructor.create({
      data: {
        lastName: "斎藤",
        firstName: "香織",
        lastNameKana: "サイトウ",
        firstNameKana: "カオリ",
        status: "INACTIVE",
        notes: "産休中。スノーボード準指導員として復帰予定。",
      },
    }),
  ]);

  console.log(
    `インストラクター: ${instructors.length}名作成 (アクティブ${instructors.filter((i) => i.status === "ACTIVE").length}名、退職${instructors.filter((i) => i.status === "RETIRED").length}名、休職${instructors.filter((i) => i.status === "INACTIVE").length}名)`
  );

  // ============================================
  // 5. インストラクター資格関連（理合性考慮）
  // ============================================
  console.log("インストラクター資格関連を作成中...");

  // 資格インデックス定義 (名誉・功労資格は除外)
  // スキー資格: [0]功労指導員, [1]功労準指導員, [2]公認指導員, [3]認定指導員, [4]名誉検定員, [5]A級検定員, [6]B級検定員, [7]C級検定員
  // スノーボード資格: [0]功労指導員, [1]功労準指導員, [2]公認指導員, [3]公認準指導員, [4]認定指導員, [5]A級検定員, [6]B級検定員, [7]C級検定員

  const certificationAssignments = [
    // === スキー専門インストラクター ===
    // 田中太郎 - 公認指導員 (最上位資格のみ)
    { instructorIndex: 0, certifications: [{ dept: "ski", certIndex: 2 }] },

    // 佐藤花子 - 認定指導員 (最上位資格のみ)
    { instructorIndex: 1, certifications: [{ dept: "ski", certIndex: 3 }] },

    // 鈴木一郎 - A級検定員 (最上位資格のみ)
    { instructorIndex: 2, certifications: [{ dept: "ski", certIndex: 5 }] },

    // 伊藤健二 - B級検定員 (最上位資格のみ)
    { instructorIndex: 3, certifications: [{ dept: "ski", certIndex: 6 }] },

    // 加藤美穂 - C級検定員 (最上位資格のみ)
    { instructorIndex: 4, certifications: [{ dept: "ski", certIndex: 7 }] },

    // === スノーボード専門インストラクター ===
    // 高橋美咲 - 公認指導員 (最上位資格のみ)
    {
      instructorIndex: 5,
      certifications: [{ dept: "snowboard", certIndex: 2 }],
    },

    // 山田健太 - A級検定員 (最上位資格のみ)
    {
      instructorIndex: 6,
      certifications: [{ dept: "snowboard", certIndex: 5 }],
    },

    // 小林雄一 - 公認準指導員 (最上位資格のみ)
    {
      instructorIndex: 7,
      certifications: [{ dept: "snowboard", certIndex: 3 }],
    },

    // 森さくら - 認定指導員 (最上位資格のみ)
    {
      instructorIndex: 8,
      certifications: [{ dept: "snowboard", certIndex: 4 }],
    },

    // 吉田和也 - B級検定員 (最上位資格のみ)
    {
      instructorIndex: 9,
      certifications: [{ dept: "snowboard", certIndex: 6 }],
    },

    // 清水麻衣 - C級検定員 (最上位資格のみ)
    {
      instructorIndex: 10,
      certifications: [{ dept: "snowboard", certIndex: 7 }],
    },

    // === スキー・スノーボード両方の資格保持者 ===
    // 松本大輔 - スキー公認指導員 + スノーボード公認指導員
    {
      instructorIndex: 11,
      certifications: [
        { dept: "ski", certIndex: 2 },
        { dept: "snowboard", certIndex: 2 },
      ],
    },

    // 中村真理 - スキーA級検定員 + スノーボード準指導員
    {
      instructorIndex: 12,
      certifications: [
        { dept: "ski", certIndex: 5 },
        { dept: "snowboard", certIndex: 3 },
      ],
    },

    // 藤田学 - スキーB級検定員 + スノーボードC級検定員
    {
      instructorIndex: 13,
      certifications: [
        { dept: "ski", certIndex: 6 },
        { dept: "snowboard", certIndex: 7 },
      ],
    },

    // === 退職・休職者 ===
    // 渡辺明 - 公認指導員 (退職者でも資格は保持)
    { instructorIndex: 14, certifications: [{ dept: "ski", certIndex: 2 }] },

    // 斎藤香織 - 公認準指導員 (休職中でも資格は保持)
    {
      instructorIndex: 15,
      certifications: [{ dept: "snowboard", certIndex: 3 }],
    },
  ];

  // 資格割り当てを実行
  let certificationCount = 0;
  for (const assignment of certificationAssignments) {
    const instructor = instructors[assignment.instructorIndex];

    if (!instructor) {
      console.warn(
        `Instructor not found at index: ${assignment.instructorIndex}`
      );
      continue;
    }

    for (const cert of assignment.certifications) {
      const certificationId =
        cert.dept === "ski"
          ? skiCertifications[cert.certIndex]?.id
          : snowboardCertifications[cert.certIndex]?.id;

      if (!certificationId) {
        console.warn(
          `Certification not found: dept=${cert.dept}, index=${cert.certIndex}`
        );
        continue;
      }

      await prisma.instructorCertification.create({
        data: {
          instructorId: instructor.id,
          certificationId,
        },
      });
      certificationCount++;
    }
  }

  console.log(`インストラクター資格関連: ${certificationCount}件作成完了`);
  console.log("   - スキー専門: 5名");
  console.log("   - スノーボード専門: 6名");
  console.log("   - 両方の資格保持: 3名");
  console.log("   - 退職・休職者: 2名");

  // ============================================
  // 6. シフトデータ（2025/12/20〜2026/3/1）
  // ============================================
  console.log("シフトデータを作成中...");

  const shifts: Array<{
    id: number;
    date: Date;
    departmentId: number;
    shiftTypeId: number;
    description: string | null;
  }> = [];
  const startDate = new Date("2025-12-20");
  const endDate = new Date("2026-03-01");

  // 日付ループ処理
  for (
    let currentDate = new Date(startDate);
    currentDate <= endDate;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    const dayOfWeek = currentDate.getDay(); // 0:日曜日, 6:土曜日
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dateString = currentDate.toISOString().split("T")[0];

    if (isWeekend) {
      // === 土日のシフト ===

      // スキー一般レッスン
      const ski1 = await prisma.shift.create({
        data: {
          date: new Date(dateString!),
          departmentId: skiDepartment.id,
          shiftTypeId: generalLessonType.id,
          description: "スキー一般レッスン",
        },
      });
      shifts.push(ski1);

      // スキー団体レッスン
      const ski2 = await prisma.shift.create({
        data: {
          date: new Date(dateString!),
          departmentId: skiDepartment.id,
          shiftTypeId: groupLessonType.id,
          description: "スキー団体レッスン",
        },
      });
      shifts.push(ski2);

      // スノーボード一般レッスン
      const snowboard1 = await prisma.shift.create({
        data: {
          date: new Date(dateString!),
          departmentId: snowboardDepartment.id,
          shiftTypeId: generalLessonType.id,
          description: "スノーボード一般レッスン",
        },
      });
      shifts.push(snowboard1);

      // スノーボード団体レッスン
      const snowboard2 = await prisma.shift.create({
        data: {
          date: new Date(dateString!),
          departmentId: snowboardDepartment.id,
          shiftTypeId: groupLessonType.id,
          description: "スノーボード団体レッスン",
        },
      });
      shifts.push(snowboard2);

      // バッジテスト・県連事業（特定の土日のみ追加）
      // 月2回程度の頻度で各種イベントを配置
      const weekOfMonth = Math.ceil(currentDate.getDate() / 7);

      // バッジテスト（第2・4土日、スキー部門のみ）
      if ((weekOfMonth === 2 || weekOfMonth === 4) && dayOfWeek === 6) {
        const badgeTest = await prisma.shift.create({
          data: {
            date: new Date(dateString!),
            departmentId: skiDepartment.id,
            shiftTypeId: badgeTestType.id,
            description: "スキーバッジテスト",
          },
        });
        shifts.push(badgeTest);
      }

      // 県連事業（月1回程度、第1日曜日のみ、スノーボード部門）
      if (weekOfMonth === 1 && dayOfWeek === 0) {
        // 第1日曜日のみ
        const prefectureEvent = await prisma.shift.create({
          data: {
            date: new Date(dateString!),
            departmentId: snowboardDepartment.id,
            shiftTypeId: prefectureEventType.id,
            description: "県連事業",
          },
        });
        shifts.push(prefectureEvent);
      }
    } else {
      // === 平日のシフト（スキー一般レッスンのみ）===

      const skiWeekday = await prisma.shift.create({
        data: {
          date: new Date(dateString!),
          departmentId: skiDepartment.id,
          shiftTypeId: generalLessonType.id,
          description: "スキー一般レッスン",
        },
      });
      shifts.push(skiWeekday);
    }
  }

  console.log(`シフト: ${shifts.length}件作成`);
  console.log(
    `   - 平日シフト: ${
      shifts.filter((s) => {
        const dayOfWeek = new Date(s.date).getDay();
        return dayOfWeek !== 0 && dayOfWeek !== 6;
      }).length
    }件`
  );
  console.log(
    `   - 土日シフト: ${
      shifts.filter((s) => {
        const dayOfWeek = new Date(s.date).getDay();
        return dayOfWeek === 0 || dayOfWeek === 6;
      }).length
    }件`
  );

  // ============================================
  // 7. シフトアサイン（部門・シフト種別兼務不可）
  // ============================================
  console.log("シフトアサインを作成中...");

  // アクティブなインストラクターのみを取得
  const activeInstructors = instructors.filter((i) => i.status === "ACTIVE");

  // 部門・資格別にインストラクターを分類
  const skiInstructors = activeInstructors.filter((_, index) => {
    const assignment = certificationAssignments.find(
      (a) => a.instructorIndex === index
    );
    return (
      assignment && assignment.certifications.some((c) => c.dept === "ski")
    );
  });

  const snowboardInstructors = activeInstructors.filter((_, index) => {
    const assignment = certificationAssignments.find(
      (a) => a.instructorIndex === index
    );
    return (
      assignment &&
      assignment.certifications.some((c) => c.dept === "snowboard")
    );
  });

  // シフトにインストラクターを割り当て
  let assignmentCount = 0;
  let skiInstructorIndex = 0;
  let snowboardInstructorIndex = 0;

  for (const shift of shifts) {
    let assignedInstructor = null;

    // 部門に応じてインストラクターを選択
    if (shift.departmentId === skiDepartment.id) {
      if (skiInstructors.length > 0) {
        assignedInstructor =
          skiInstructors[skiInstructorIndex % skiInstructors.length];
        skiInstructorIndex++;
      }
    } else if (
      shift.departmentId === snowboardDepartment.id &&
      snowboardInstructors.length > 0
    ) {
      assignedInstructor =
        snowboardInstructors[
          snowboardInstructorIndex % snowboardInstructors.length
        ];
      snowboardInstructorIndex++;
    }

    // アサインを作成
    if (assignedInstructor) {
      await prisma.shiftAssignment.create({
        data: {
          shiftId: shift.id,
          instructorId: assignedInstructor.id,
        },
      });
      assignmentCount++;
    }
  }

  console.log(`シフトアサイン: ${assignmentCount}件作成`);
  console.log(`   - スキー担当: ${skiInstructors.length}名`);
  console.log(`   - スノーボード担当: ${snowboardInstructors.length}名`);

  console.log("\n初期データ投入完了！");
  console.log("\n投入データサマリー:");
  console.log("  - 部門: 2件 (スキー, スノーボード)");
  console.log(
    "  - シフト種類: 4件 (一般レッスン, 団体レッスン, バッジテスト, 県連事業)"
  );
  console.log(
    `  - 資格: ${skiCertifications.length + snowboardCertifications.length}件 (スキー${skiCertifications.length}件, スノーボード${snowboardCertifications.length}件)`
  );
  console.log(`  - インストラクター: ${instructors.length}名`);
  console.log(
    `    - アクティブ: ${instructors.filter((i) => i.status === "ACTIVE").length}名`
  );
  console.log(
    `    - 退職: ${instructors.filter((i) => i.status === "RETIRED").length}名`
  );
  console.log(
    `    - 休職: ${instructors.filter((i) => i.status === "INACTIVE").length}名`
  );
  console.log(`  - 資格割り当て: ${certificationCount}件`);
  console.log("    - スキー専門: 5名");
  console.log("    - スノーボード専門: 6名");
  console.log("    - 両方資格保持: 3名");
  console.log("    - 退職・休職者: 2名");
  console.log(`  - シフト: ${shifts.length}件 (2025/12/20〜2026/3/1)`);
  console.log(`  - シフトアサイン: ${assignmentCount}件`);
  console.log("\n開発準備完了！シフト管理システムの全データが整備されました。");
}

main()
  .catch((e) => {
    console.error("シードデータ投入エラー:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
