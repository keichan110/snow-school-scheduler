"use client";

import { Search, User } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { InstructorListItem } from "./instructor-list-item";
import { SelectedInstructorsList } from "./selected-instructors-list";

type Certification = {
  id: number;
  name: string;
  shortName: string;
  organization: string;
  department: {
    id: number;
    name: string;
  };
};

type Instructor = {
  id: number;
  lastName: string;
  firstName: string;
  lastNameKana?: string;
  firstNameKana?: string;
  status: string;
  certifications: Certification[];
};

type InstructorSelectorProps = {
  instructors: Instructor[];
  selectedInstructorIds: number[];
  departmentId: number;
  isLoading: boolean;
  errors: {
    instructors?: string;
    submit?: string;
  };
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
};

export function InstructorSelector({
  instructors,
  selectedInstructorIds,
  departmentId,
  isLoading,
  errors,
  onToggle,
  onRemove,
}: InstructorSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // インストラクター検索フィルタリング
  const filteredInstructors = instructors.filter((instructor) => {
    if (!searchTerm) {
      return true;
    }

    const searchLower = searchTerm.toLowerCase();
    return (
      instructor.lastName.toLowerCase().includes(searchLower) ||
      instructor.firstName.toLowerCase().includes(searchLower) ||
      instructor.lastNameKana?.toLowerCase().includes(searchLower) ||
      instructor.firstNameKana?.toLowerCase().includes(searchLower)
    );
  });

  const selectedInstructors = instructors.filter((instructor) =>
    selectedInstructorIds.includes(instructor.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="font-medium text-sm">
          インストラクター選択 <span className="text-red-500">*</span>
        </Label>
        <div className="text-muted-foreground text-xs">
          {selectedInstructorIds.length}名選択中
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground text-sm">
          読み込み中...
        </div>
      ) : (
        <>
          {/* 選択済みインストラクター表示エリア */}
          <SelectedInstructorsList
            instructors={selectedInstructors}
            onRemove={onRemove}
          />

          {/* 検索フォーム */}
          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-9 text-sm placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="名前またはフリガナで検索"
              type="text"
              value={searchTerm}
            />
          </div>

          {/* インストラクターリスト */}
          <div className="max-h-96 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700">
            {filteredInstructors.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                <User className="h-12 w-12 opacity-30" />
                <p className="text-center text-sm">
                  {searchTerm
                    ? "検索条件に一致するインストラクターが見つかりません"
                    : "インストラクターが登録されていません"}
                </p>
              </div>
            ) : (
              filteredInstructors.map((instructor) => {
                const isSelected = selectedInstructorIds.includes(
                  instructor.id
                );
                const hasRequiredCertification =
                  instructor.certifications.filter(
                    (cert) => cert.department.id === departmentId
                  ).length > 0;
                const departmentCertifications =
                  instructor.certifications.filter(
                    (cert) => cert.department.id === departmentId
                  );

                return (
                  <InstructorListItem
                    departmentCertifications={departmentCertifications}
                    hasRequiredCertification={hasRequiredCertification}
                    instructor={instructor}
                    isSelected={isSelected}
                    key={instructor.id}
                    onToggle={onToggle}
                  />
                );
              })
            )}
          </div>

          {/* 選択状況の統計 */}
          <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-muted-foreground text-xs dark:border-gray-700 dark:bg-gray-900">
            <div>
              表示: {filteredInstructors.length}名{searchTerm && " (検索結果)"}
            </div>
            <div>
              認定済み:{" "}
              <span className="font-semibold text-foreground">
                {
                  filteredInstructors.filter(
                    (i) =>
                      i.certifications.filter(
                        (c) => c.department.id === departmentId
                      ).length > 0
                  ).length
                }
                名
              </span>
            </div>
          </div>
        </>
      )}

      {errors.instructors && (
        <p className="text-red-500 text-sm">{errors.instructors}</p>
      )}
      {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}
    </div>
  );
}
