"use client";

import { Label } from "@/components/ui/label";
import type { Department } from "../_lib/types";
import { DepartmentSelector } from "./department-selector";

type ShiftType = {
  id: number;
  name: string;
};

type ShiftBasicInfoFormProps = {
  departments: Department[];
  shiftTypes: ShiftType[];
  formData: {
    departmentId: number;
    shiftTypeId: number;
    notes: string;
  };
  errors: {
    departmentId?: string;
    shiftTypeId?: string;
  };
  isLoading: boolean;
  onDepartmentChange: (id: number) => void;
  onShiftTypeChange: (id: number) => void;
  onNotesChange: (notes: string) => void;
};

export function ShiftBasicInfoForm({
  departments,
  shiftTypes,
  formData,
  errors,
  isLoading,
  onDepartmentChange,
  onShiftTypeChange,
  onNotesChange,
}: ShiftBasicInfoFormProps) {
  return (
    <>
      {/* 部門選択 */}
      <DepartmentSelector
        departments={departments}
        error={errors.departmentId}
        isLoading={isLoading}
        onSelect={onDepartmentChange}
        selectedId={formData.departmentId}
      />

      {/* シフト種類選択 */}
      <div className="space-y-3">
        <Label className="font-medium text-sm" htmlFor="shiftType">
          シフト種類 <span className="text-red-500">*</span>
        </Label>
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
          id="shiftType"
          onChange={(e) => {
            const value = Number.parseInt(e.target.value, 10) || 0;
            onShiftTypeChange(value);
          }}
          value={formData.shiftTypeId}
        >
          <option value={0}>選択してください</option>
          {shiftTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        {errors.shiftTypeId && (
          <p className="text-red-500 text-sm">{errors.shiftTypeId}</p>
        )}
      </div>

      {/* 備考 */}
      <div className="space-y-3">
        <Label className="font-medium text-sm" htmlFor="notes">
          備考
        </Label>
        <textarea
          className="w-full rounded-md border border-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          id="notes"
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="追加の情報があれば入力してください"
          rows={4}
          value={formData.notes}
        />
      </div>
    </>
  );
}
