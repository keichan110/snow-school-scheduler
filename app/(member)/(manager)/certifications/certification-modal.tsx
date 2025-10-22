"use client";

import {
  FileText,
  Info,
  PersonSimpleSki,
  PersonSimpleSnowboard,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useNotification } from "@/app/_components/shared/notifications";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { CertificationFormData, CertificationModalProps } from "./types";
import { getDepartmentType } from "./utils";

export default function CertificationModal({
  isOpen,
  onClose,
  certification,
  onSave,
}: CertificationModalProps) {
  const { showNotification } = useNotification();
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
  }, [certification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave(formData);
      showNotification(
        certification
          ? "資格が正常に更新されました"
          : "資格が正常に作成されました",
        "success"
      );
      onClose();
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "保存に失敗しました",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer onOpenChange={onClose} open={isOpen}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-7xl">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2 text-2xl">
              {certification ? "資格編集" : "新しい資格を追加"}
            </DrawerTitle>
          </DrawerHeader>

          <ScrollArea className="h-auto max-h-[60vh] overflow-auto overflow-y-auto p-4">
            <form
              className="space-y-6"
              id="certification-form"
              onSubmit={handleSubmit}
            >
              {/* 基本情報セクション */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-semibold text-lg">
                  <Info className="h-5 w-5 text-primary" weight="regular" />
                  基本情報
                </div>

                {/* 部門選択（全幅） */}
                <div className="space-y-2">
                  <Label className="font-medium text-sm">
                    部門 <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    className="flex gap-4"
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        department: value as "ski" | "snowboard",
                      }))
                    }
                    value={formData.department}
                  >
                    <div className="flex cursor-pointer items-center space-x-2 rounded-lg border p-3 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                      <RadioGroupItem id="ski" value="ski" />
                      <Label
                        className="flex cursor-pointer items-center gap-2"
                        htmlFor="ski"
                      >
                        <PersonSimpleSki className="h-5 w-5" weight="regular" />
                        <span className="font-medium">スキー</span>
                      </Label>
                    </div>
                    <div className="flex cursor-pointer items-center space-x-2 rounded-lg border p-3 hover:bg-accent has-[:checked]:border-accent has-[:checked]:bg-accent/20">
                      <RadioGroupItem id="snowboard" value="snowboard" />
                      <Label
                        className="flex cursor-pointer items-center gap-2"
                        htmlFor="snowboard"
                      >
                        <PersonSimpleSnowboard
                          className="h-5 w-5"
                          weight="regular"
                        />
                        <span className="font-medium">スノーボード</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* 資格名（幅制限） */}
                <div className="space-y-2">
                  <Label className="font-medium text-sm" htmlFor="shortName">
                    資格名 <span className="text-destructive">*</span>
                  </Label>
                  <div className="max-w-md">
                    <Input
                      id="shortName"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          shortName: e.target.value,
                        }))
                      }
                      placeholder="例: 指導員"
                      required
                      value={formData.shortName}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    シフト表示などで使用する資格名を入力してください
                  </p>
                </div>

                {/* 発行組織と正式名称を2カラム（発行組織は小さく） */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[200px_1fr]">
                  <div className="space-y-2">
                    <Label
                      className="font-medium text-sm"
                      htmlFor="organization"
                    >
                      発行組織 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="organization"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          organization: e.target.value,
                        }))
                      }
                      placeholder="例: SAJ"
                      required
                      value={formData.organization}
                    />
                    <p className="text-muted-foreground text-xs">
                      資格を発行した組織名を入力してください
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      className="font-medium text-sm"
                      htmlFor="certificationName"
                    >
                      正式名称 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="certificationName"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="例: 全日本スキー連盟公認スキー指導員"
                      required
                      value={formData.name}
                    />
                    <p className="text-muted-foreground text-xs">
                      正式な資格名称を入力してください
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 詳細情報セクション */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-semibold text-lg">
                  <FileText className="h-5 w-5 text-primary" weight="regular" />
                  詳細情報
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-sm" htmlFor="description">
                    説明・備考
                  </Label>
                  <Textarea
                    id="description"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="資格の詳細説明、取得条件、有効期限などを記載してください"
                    rows={4}
                    value={formData.description}
                  />
                  <p className="text-muted-foreground text-xs">
                    資格の詳細情報や注意事項などを記載（省略可）
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-sm">有効</Label>
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
                    <Label className="text-muted-foreground text-sm">
                      {formData.status === "active" ? "有効" : "無効"}
                    </Label>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    無効にした資格は新規割り当てができなくなります
                  </p>
                </div>
              </div>
            </form>
          </ScrollArea>

          <DrawerFooter>
            <div className="flex w-full gap-2">
              <DrawerClose asChild>
                <Button
                  className="flex-1"
                  disabled={isSubmitting}
                  type="button"
                  variant="outline"
                >
                  キャンセル
                </Button>
              </DrawerClose>
              <Button
                className="flex-1"
                disabled={isSubmitting}
                form="certification-form"
                type="submit"
              >
                {isSubmitting ? "保存中..." : "保存"}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
