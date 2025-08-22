#!/usr/bin/env node

/**
 * カバレッジバッジ生成用スクリプト
 * coverage/coverage-summary.jsonからカバレッジ情報を読み取り、
 * shields.io用のバッジ情報を生成
 */

const fs = require('fs');
const path = require('path');

const COVERAGE_FILE = path.join(__dirname, '../coverage/coverage-summary.json');
const BADGE_FILE = path.join(__dirname, '../coverage/badge-info.json');

function generateBadgeInfo() {
  try {
    if (!fs.existsSync(COVERAGE_FILE)) {
      console.error('Coverage summary file not found. Run `npm run test:coverage` first.');
      process.exit(1);
    }

    const coverageData = JSON.parse(fs.readFileSync(COVERAGE_FILE, 'utf8'));
    const total = coverageData.total;

    // 各メトリクスの平均を計算
    const metrics = {
      lines: total.lines.pct || 0,
      functions: total.functions.pct || 0,
      branches: total.branches.pct || 0,
      statements: total.statements.pct || 0,
    };

    const average = Math.round(
      (metrics.lines + metrics.functions + metrics.branches + metrics.statements) / 4
    );

    // バッジ色の決定
    let color = 'red';
    if (average >= 90) color = 'brightgreen';
    else if (average >= 80) color = 'green';
    else if (average >= 70) color = 'yellow';
    else if (average >= 60) color = 'orange';

    const badgeInfo = {
      schemaVersion: 1,
      label: 'coverage',
      message: `${average}%`,
      color: color,
      details: metrics,
      timestamp: new Date().toISOString(),
    };

    // バッジ情報をファイルに出力
    fs.writeFileSync(BADGE_FILE, JSON.stringify(badgeInfo, null, 2));

    // shields.io用URL生成
    const shieldsUrl = `https://img.shields.io/badge/coverage-${average}%25-${color}`;

    console.log('Coverage badge info generated:');
    console.log(`  Total coverage: ${average}%`);
    console.log(`  Lines: ${metrics.lines}%`);
    console.log(`  Functions: ${metrics.functions}%`);
    console.log(`  Branches: ${metrics.branches}%`);
    console.log(`  Statements: ${metrics.statements}%`);
    console.log(`  Badge URL: ${shieldsUrl}`);

    return badgeInfo;
  } catch (error) {
    console.error('Error generating badge info:', error.message);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  generateBadgeInfo();
}

module.exports = { generateBadgeInfo };
