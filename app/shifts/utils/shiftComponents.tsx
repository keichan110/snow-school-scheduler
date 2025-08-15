'use client';

import React from 'react';
import { Calendar, User, PersonSimpleSki, PersonSimpleSnowboard } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { DepartmentType, DayData, AssignedInstructor } from '../../admin/shifts/types';
import { getDepartmentBgClass } from '../../admin/shifts/utils/shiftUtils';
import { DEPARTMENT_STYLES, DEPARTMENT_NAMES } from '../../admin/shifts/constants/shiftConstants';

/**
 * インストラクターチップを生成する共通関数
 * 実際にアサインされたインストラクター情報を使用
 */
export function generateInstructorChips(
  assignedInstructors: AssignedInstructor[],
  departmentType: DepartmentType
) {
  const chipClass = DEPARTMENT_STYLES[departmentType].chipClass;

  return assignedInstructors.map((instructor) => (
    <div
      key={instructor.id}
      className={cn(
        'inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 hover:scale-105',
        chipClass
      )}
    >
      <User className="h-3 w-3" weight="fill" />
      {instructor.displayName}
    </div>
  ));
}

/**
 * 部門セクションを作成する共通関数
 */
export function createDepartmentSection(
  departmentType: DepartmentType,
  shifts: DayData['shifts'],
  icon: React.ReactNode
) {
  const departmentName = DEPARTMENT_NAMES[departmentType];
  const styles = DEPARTMENT_STYLES[departmentType];
  const {
    sectionBgClass: bgClass,
    sectionBorderClass: borderClass,
    sectionTextClass: textClass,
  } = styles;

  return (
    <div
      key={departmentType}
      className={cn(
        'rounded-xl border p-3 transition-all duration-300 md:p-4',
        bgClass,
        borderClass
      )}
    >
      <div className="md:flex md:items-start md:gap-4">
        {/* 部門ヘッダー */}
        <div className="mb-3 flex items-center gap-2 md:mb-0 md:w-40 md:flex-shrink-0 md:gap-3">
          {icon}
          <div>
            <h4 className={cn('text-base font-semibold md:text-lg', textClass)}>
              {departmentName}
            </h4>
            <p className="text-xs text-muted-foreground">{styles.label}</p>
          </div>
        </div>

        {/* シフト種類とインストラクター */}
        <div className="flex-1 space-y-3">
          {shifts
            .filter((s) => s.department === departmentType)
            .map((shift, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-background p-3 transition-all duration-200 hover:shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between md:mb-3">
                  <div
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm font-medium text-foreground',
                      getDepartmentBgClass(shift.department as DepartmentType)
                    )}
                  >
                    {shift.type}
                  </div>
                  <div className="text-xs text-muted-foreground">{shift.count}名配置</div>
                </div>
                <div className="space-y-1 md:flex md:flex-wrap md:gap-2 md:space-y-0">
                  {shift.assignedInstructors && shift.assignedInstructors.length > 0 ? (
                    generateInstructorChips(shift.assignedInstructors, departmentType)
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      インストラクターが未配置です
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 部門別のアイコンを取得する関数
 */
export function getDepartmentIcon(departmentType: DepartmentType, className?: string) {
  const iconClass = cn('h-5 w-5', DEPARTMENT_STYLES[departmentType].iconColor, className);

  switch (departmentType) {
    case 'ski':
      return <PersonSimpleSki className={iconClass} weight="fill" />;
    case 'snowboard':
      return <PersonSimpleSnowboard className={iconClass} weight="fill" />;
    case 'mixed':
      return <Calendar className={iconClass} weight="fill" />;
    default:
      return <Calendar className={iconClass} weight="fill" />;
  }
}

/**
 * 部門別のセクションを生成する関数（統一されたアイコン付き）
 */
export function renderDepartmentSections(shifts: DayData['shifts']) {
  const sections: React.ReactNode[] = [];

  // スキー部門
  if (shifts.filter((s) => s.department === 'ski').length > 0) {
    sections.push(createDepartmentSection('ski', shifts, getDepartmentIcon('ski')));
  }

  // スノーボード部門
  if (shifts.filter((s) => s.department === 'snowboard').length > 0) {
    sections.push(createDepartmentSection('snowboard', shifts, getDepartmentIcon('snowboard')));
  }

  // 共通部門
  if (shifts.filter((s) => s.department === 'mixed').length > 0) {
    sections.push(createDepartmentSection('mixed', shifts, getDepartmentIcon('mixed')));
  }

  return sections;
}
