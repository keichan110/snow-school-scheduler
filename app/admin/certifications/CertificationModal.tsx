"use client";

import { useState, useEffect } from "react";
import { Info, FileText, PersonSimpleSki, PersonSimpleSnowboard } from "@phosphor-icons/react";
import type { CertificationModalProps, CertificationFormData } from "./types";
import { getDepartmentType } from "./utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function CertificationModal({
  isOpen,
  onClose,
  certification,
  onSave,
}: CertificationModalProps) {
  const [formData, setFormData] = useState<CertificationFormData>({
    name: "",
    shortName: "",
    department: "ski",
    organization: "",
    description: "",
    status: "active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (certification) {
      // 編集モード
      const deptType = getDepartmentType(certification.department.name);

      setFormData({
        name: certification.name,
        shortName: certification.shortName || "",
        department: deptType,
        organization: certification.organization,
        description: certification.description || "",
        status: certification.isActive ? "active" : "inactive",
      });
    } else {
      // 新規追加モード
      setFormData({
        name: "",
        shortName: "",
        department: "ski",
        organization: "",
        description: "",
        status: "active",
      });
    }
  }, [certification, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      alert(error instanceof Error ? error.message : "保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[96vh]">
        <div className="max-w-7xl mx-auto w-full">
          <DrawerHeader>
            <DrawerTitle className="text-2xl flex items-center gap-2">
              {certification ? "資格編集" : "新しい資格を追加"}
            </DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-4 overflow-y-auto flex-1">
            <form id="certification-form" onSubmit={handleSubmit} className="space-y-6">
              {/* 基本情報セクション */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Info className="w-5 h-5 text-primary" weight="regular" />
                  基本情報
                </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                部門 <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={formData.department}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, department: value as "ski" | "snowboard" }))
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <RadioGroupItem value="ski" id="ski" />
                  <Label htmlFor="ski" className="flex items-center gap-2 cursor-pointer">
                    <PersonSimpleSki className="w-5 h-5" weight="regular" />
                    <span className="font-medium">スキー</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer has-[:checked]:border-accent has-[:checked]:bg-accent/20">
                  <RadioGroupItem value="snowboard" id="snowboard" />
                  <Label htmlFor="snowboard" className="flex items-center gap-2 cursor-pointer">
                    <PersonSimpleSnowboard className="w-5 h-5" weight="regular" />
                    <span className="font-medium">スノーボード</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortName" className="text-sm font-medium">
                資格名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="shortName"
                placeholder="例: 指導員"
                value={formData.shortName}
                onChange={(e) => setFormData((prev) => ({ ...prev, shortName: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">シフト表示などで使用する資格名を入力してください</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization" className="text-sm font-medium">
                発行組織 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="organization"
                placeholder="例: SAJ"
                value={formData.organization}
                onChange={(e) => setFormData((prev) => ({ ...prev, organization: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">資格を発行した組織名を入力してください</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificationName" className="text-sm font-medium">
                正式名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="certificationName"
                placeholder="例: 全日本スキー連盟公認スキー指導員"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">正式な資格名称を入力してください</p>
            </div>
          </div>

          <Separator />

              {/* 詳細情報セクション */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <FileText className="w-5 h-5 text-primary" weight="regular" />
                  詳細情報
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    説明・備考
                  </Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="資格の詳細説明、取得条件、有効期限などを記載してください"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">資格の詳細情報や注意事項などを記載（省略可）</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">有効</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.status === "active"}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: checked ? "active" : "inactive",
                        }))
                      }
                    />
                    <Label className="text-sm text-muted-foreground">
                      {formData.status === "active" ? "有効" : "無効"}
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">無効にした資格は新規割り当てができなくなります</p>
                </div>
              </div>
          </form>
        </div>

          <DrawerFooter>
            <div className="flex gap-2 w-full">
              <Button
                type="submit"
                form="certification-form"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 hover:shadow-lg hover:scale-105 transition-all duration-300 flex-1"
              >
                {isSubmitting ? "保存中..." : "保存"}
              </Button>
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  キャンセル
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
