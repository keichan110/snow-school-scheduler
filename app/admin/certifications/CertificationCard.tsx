"use client";

import { PencilSimple, PersonSimpleSki, PersonSimpleSnowboard } from "@phosphor-icons/react";
import type { CertificationCardProps } from "./types";
import { getDepartmentType } from "./utils";

export default function CertificationCard({ certification, onEdit }: CertificationCardProps) {
  const departmentInfo = {
    ski: { icon: PersonSimpleSki, name: "スキー" },
    snowboard: { icon: PersonSimpleSnowboard, name: "スノーボード" },
  };

  // department.nameから部門タイプを判定
  const deptType = getDepartmentType(certification.department.name);

  const dept = departmentInfo[deptType];
  const isActive = certification.isActive;

  // 部門タイプに応じたスタイリング
  let bgClass, borderClass, textClass;

  if (isActive) {
    if (deptType === "ski") {
      bgClass = "bg-gradient-to-r from-blue-50 to-blue-100";
      borderClass = "border-blue-300";
      textClass = "text-blue-800";
    } else if (deptType === "snowboard") {
      bgClass = "bg-gradient-to-r from-amber-50 to-amber-100";
      borderClass = "border-amber-300";
      textClass = "text-amber-800";
    } else {
      bgClass = "bg-gradient-to-r from-gray-50 to-gray-100";
      borderClass = "border-gray-300";
      textClass = "text-gray-800";
    }
  } else {
    bgClass = "bg-gradient-to-r from-gray-50 to-gray-100";
    borderClass = "border-gray-300";
    textClass = "text-gray-600";
  }

  const cardClasses = [
    bgClass,
    "rounded-xl p-3 md:p-4 border-r-2 border-b-4",
    borderClass,
    `hover:${borderClass}`,
    "transition-all duration-300 cursor-pointer relative overflow-hidden",
    "hover:-translate-y-0.5 hover:shadow-lg",
  ]
    .filter(Boolean)
    .join(" ");

  // 部門バッジのスタイリング（グラデーション背景に合わせて調整）
  const departmentBadgeClass = isActive
    ? deptType === "ski"
      ? "inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold bg-white/70 text-blue-800 border border-blue-200"
      : "inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold bg-white/70 text-amber-800 border border-amber-200"
    : "inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold bg-white/70 text-gray-600 border border-gray-200";

  const statusBadgeClass = "px-2 py-1 rounded-xl text-xs font-semibold bg-red-100 text-red-600";

  return (
    <div className={cardClasses}>
      <div className="flex items-start justify-between mb-3">
        <div className={departmentBadgeClass}>
          <dept.icon className="w-4 h-4" weight="regular" />
          <span>{dept.name}</span>
        </div>
        {!isActive && <div className={statusBadgeClass}>無効</div>}
      </div>

      <div className="mb-4">
        <h3 className={`text-lg font-bold mb-1 ${textClass}`}>{certification.name}</h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg text-xs font-medium">
            {certification.organization}
          </span>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-xs text-gray-500">{certification.shortName || "N/A"}</span>
        </div>
        <p className={`text-sm line-clamp-2 ${textClass}`}>
          {certification.description || "説明なし"}
        </p>
      </div>

      <div className="flex items-center justify-end text-sm">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(certification);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="編集"
          >
            <PencilSimple className="w-4 h-4" weight="regular" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
