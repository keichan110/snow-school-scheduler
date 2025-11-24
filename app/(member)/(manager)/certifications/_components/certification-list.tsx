"use client";

import { Plus } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { DepartmentIcon } from "@/app/(member)/_components/department-icon";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDepartmentType } from "@/lib/utils/department-type";
import type { ActionResult } from "@/types/actions";
import type {
  CreateCertificationInput,
  UpdateCertificationInput,
} from "../_lib/schemas";
import type { CertificationWithDepartment } from "../_lib/types";
import CertificationModal from "./certification-modal";

/**
 * 資格一覧コンポーネントのプロパティ
 */
type CertificationListProps = {
  /** 表示する資格の配列 */
  certifications: CertificationWithDepartment[];
  /** 資格作成アクション */
  onCreateCertification: (
    input: CreateCertificationInput
  ) => Promise<ActionResult<unknown>>;
  /** 資格更新アクション */
  onUpdateCertification: (
    id: number,
    input: UpdateCertificationInput
  ) => Promise<ActionResult<unknown>>;
};

/**
 * 資格行コンポーネントのプロパティ
 */
type CertificationRowProps = {
  /** 表示する資格データ */
  certification: CertificationWithDepartment;
  /** モーダルを開くコールバック */
  onOpenModal: (cert: CertificationWithDepartment) => void;
};

/**
 * 資格テーブルの1行を表示するコンポーネント
 *
 * @remarks
 * 各資格を部門別に色分けされた行として表示します。
 * クリックすることで編集モーダルを開きます。
 *
 * @param props - コンポーネントのプロパティ
 * @returns テーブル行コンポーネント
 */
function CertificationRow({
  certification,
  onOpenModal,
}: CertificationRowProps) {
  const deptType = getDepartmentType(certification.department.name);

  const departmentStyles = {
    ski: {
      row: "bg-ski-50/30 hover:bg-ski-50/50 dark:bg-ski-900/5 dark:hover:bg-ski-900/10",
      icon: "text-ski-600 dark:text-ski-400",
      text: "text-foreground",
    },
    snowboard: {
      row: "bg-snowboard-50/30 hover:bg-snowboard-50/50 dark:bg-snowboard-900/5 dark:hover:bg-snowboard-900/10",
      icon: "text-snowboard-600 dark:text-snowboard-400",
      text: "text-foreground",
    },
  }[deptType];

  return (
    <TableRow
      className={`cursor-pointer transition-colors ${departmentStyles.row} ${
        certification.isActive ? "" : "opacity-60"
      }`}
      key={certification.id}
      onClick={() => onOpenModal(certification)}
    >
      <TableCell>
        <DepartmentIcon
          className={`h-5 w-5 ${departmentStyles.icon}`}
          type={deptType}
        />
      </TableCell>
      <TableCell>
        <span
          className={`whitespace-nowrap font-mono text-xs md:whitespace-normal ${
            departmentStyles.text
          } ${certification.isActive ? "" : "line-through"}`}
        >
          {certification.shortName || "-"}
        </span>
      </TableCell>
      <TableCell
        className={`whitespace-nowrap font-medium md:whitespace-normal ${
          departmentStyles.text
        } ${certification.isActive ? "" : "line-through"}`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded px-2 py-1 font-medium text-xs ${deptType === "ski" ? "badge-ski" : "badge-snowboard"}`}
          >
            {certification.organization}
          </span>
          <span>{certification.name}</span>
        </div>
      </TableCell>
      <TableCell
        className={`hidden max-w-xs md:table-cell ${
          certification.isActive ? "" : "line-through"
        }`}
      >
        <p
          className={`line-clamp-2 text-sm ${departmentStyles.text} opacity-70`}
        >
          {certification.description || "説明なし"}
        </p>
      </TableCell>
    </TableRow>
  );
}

/**
 * 資格一覧テーブルコンポーネント
 *
 * @remarks
 * Client Component として実装され、モーダルの開閉状態を管理します。
 * Server Component から渡されたデータをテーブル形式で表示し、
 * 各行をクリックすることで編集モーダルを開くことができます。
 *
 * 機能:
 * - 資格一覧のテーブル表示
 * - 新規追加ボタン
 * - 行クリックでの編集モーダル表示
 * - 空状態の表示
 *
 * @param props - コンポーネントのプロパティ
 * @returns 資格一覧テーブルコンポーネント
 */
export function CertificationList({
  certifications,
  onCreateCertification,
  onUpdateCertification,
}: CertificationListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertification, setEditingCertification] =
    useState<CertificationWithDepartment | null>(null);

  /**
   * モーダルを開く
   *
   * @param certification - 編集する資格（未指定の場合は新規追加）
   */
  const handleOpenModal = (certification?: CertificationWithDepartment) => {
    setEditingCertification(certification ?? null);
    setIsModalOpen(true);
  };

  /**
   * モーダルを閉じる
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCertification(null);
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between px-4">
        <Button
          className="flex items-center gap-2"
          onClick={() => handleOpenModal()}
        >
          <Plus className="h-4 w-4" weight="regular" />
          追加
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-white dark:bg-gray-900">
            <TableHead className="w-12" />
            <TableHead className="min-w-[80px]">資格名</TableHead>
            <TableHead className="min-w-[200px]">正式名称</TableHead>
            <TableHead className="hidden min-w-[300px] md:table-cell">
              説明
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certifications.length === 0 ? (
            <TableRow>
              <TableCell
                className="py-8 text-center text-muted-foreground"
                colSpan={4}
              >
                フィルター条件に一致する資格がありません
              </TableCell>
            </TableRow>
          ) : (
            certifications.map((certification) => (
              <CertificationRow
                certification={certification}
                key={certification.id}
                onOpenModal={handleOpenModal}
              />
            ))
          )}
        </TableBody>
      </Table>

      <CertificationModal
        certification={editingCertification}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreateCertification={onCreateCertification}
        onUpdateCertification={onUpdateCertification}
      />
    </>
  );
}
