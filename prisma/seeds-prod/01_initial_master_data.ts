import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('スキー・スノーボードスクール プロダクションマスタデータ投入開始...\n');

  // ============================================
  // 1. 部門データ（マスタ）
  // ============================================
  console.log('部門データを作成中...');

  const skiDepartment = await prisma.department.upsert({
    where: { code: 'ski' },
    update: {},
    create: { code: 'ski', name: 'スキー', description: 'スキー部門' },
  });

  const snowboardDepartment = await prisma.department.upsert({
    where: { code: 'snowboard' },
    update: {},
    create: { code: 'snowboard', name: 'スノーボード', description: 'スノーボード部門' },
  });

  console.log(`部門: ${skiDepartment.name}, ${snowboardDepartment.name}`);

  // ============================================
  // 2. シフト種類データ（マスタ）
  // ============================================
  console.log('シフト種類を作成中...');

  const ensureShiftType = async (name: string) => {
    const existing = await prisma.shiftType.findFirst({ where: { name } });
    if (existing) return existing;
    return prisma.shiftType.create({ data: { name } });
  };

  const generalLessonType = await ensureShiftType('一般レッスン');
  const groupLessonType = await ensureShiftType('団体レッスン');
  const badgeTestType = await ensureShiftType('バッジテスト');
  const prefectureEventType = await ensureShiftType('県連事業');

  console.log(
    `シフト種類: ${generalLessonType.name}, ${groupLessonType.name}, ${badgeTestType.name}, ${prefectureEventType.name}`
  );

  // ============================================
  // 3. 資格データ（マスタ）
  // ============================================
  console.log('資格データを作成中...');

  // スキー資格
  const skiCertificationsData = [
    { name: '公認スキー指導員', shortName: '指導員', organization: 'SAJ', description: '' },
    { name: '公認スキー準指導員', shortName: '準指導員', organization: 'SAJ', description: '' },
    { name: '認定スキー指導員', shortName: '認定指導員', organization: 'SAS', description: '' },
    { name: '公認スキーA級検定員', shortName: 'A級検定員', organization: 'SAJ', description: '' },
    { name: '公認スキーB級検定員', shortName: 'B級検定員', organization: 'SAJ', description: '' },
    { name: '公認スキーC級検定員', shortName: 'C級検定員', organization: 'SAJ', description: '' },
  ];

  const skiCertifications = await Promise.all(
    skiCertificationsData.map(async (cert) => {
      const existing = await prisma.certification.findFirst({
        where: {
          departmentId: skiDepartment.id,
          name: cert.name,
        },
      });

      if (existing) return existing;

      return prisma.certification.create({
        data: { ...cert, departmentId: skiDepartment.id },
      });
    })
  );

  // スノーボード資格
  const snowboardCertificationsData = [
    { name: '公認スノーボード指導員', shortName: '指導員', organization: 'SAJ', description: '' },
    {
      name: '公認スノーボード準指導員',
      shortName: '準指導員',
      organization: 'SAJ',
      description: '',
    },
    {
      name: '認定スノーボード指導員',
      shortName: '認定指導員',
      organization: 'SAS',
      description: '',
    },
    {
      name: '公認スノーボードA級検定員',
      shortName: 'A級検定員',
      organization: 'SAJ',
      description: '',
    },
    {
      name: '公認スノーボードB級検定員',
      shortName: 'B級検定員',
      organization: 'SAJ',
      description: '',
    },
    {
      name: '公認スノーボードC級検定員',
      shortName: 'C級検定員',
      organization: 'SAJ',
      description: '',
    },
  ];

  const snowboardCertifications = await Promise.all(
    snowboardCertificationsData.map(async (cert) => {
      const existing = await prisma.certification.findFirst({
        where: {
          departmentId: snowboardDepartment.id,
          name: cert.name,
        },
      });

      if (existing) return existing;

      return prisma.certification.create({
        data: { ...cert, departmentId: snowboardDepartment.id },
      });
    })
  );

  console.log(
    `資格: スキー${skiCertifications.length}件, スノボ${snowboardCertifications.length}件`
  );

  console.log('\nプロダクションマスタデータ投入完了！');
  console.log('\n投入データサマリー:');
  console.log(`  - 部門: 2件 (スキー, スノーボード)`);
  console.log(`  - シフト種類: 4件 (一般レッスン, 団体レッスン, バッジテスト, 県連事業)`);
  console.log(
    `  - 資格: ${skiCertifications.length + snowboardCertifications.length}件 (スキー${skiCertifications.length}件, スノーボード${snowboardCertifications.length}件)`
  );
  console.log('\nプロダクション環境のマスタデータが整備されました。');
}

main()
  .catch((e) => {
    console.error('シードデータ投入エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
