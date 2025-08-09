"use client";

import { useState, useEffect } from "react";
import { Info, User, SealCheck, UserGear, UserMinus, PersonSimpleSki, PersonSimpleSnowboard } from "@phosphor-icons/react";
import type { InstructorModalProps, InstructorFormData } from "./types";
import { fetchCertifications } from "../certifications/api";
import { getDepartmentType } from "../certifications/utils";
import type { CertificationWithDepartment } from "../certifications/types";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

export default function InstructorModal({
  isOpen,
  onClose,
  instructor,
  onSave,
}: InstructorModalProps) {
  const [formData, setFormData] = useState<InstructorFormData>({
    lastName: "",
    firstName: "",
    lastNameKana: "",
    firstNameKana: "",
    status: "active",
    notes: "",
    certificationIds: [],
  });
  const [availableCertifications, setAvailableCertifications] = useState<CertificationWithDepartment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCertifications, setIsLoadingCertifications] = useState(false);

  useEffect(() => {
    if (instructor) {
      // 編集モード
      setFormData({
        lastName: instructor.lastName,
        firstName: instructor.firstName,
        lastNameKana: instructor.lastNameKana || "",
        firstNameKana: instructor.firstNameKana || "",
        status: instructor.status === "ACTIVE" ? "active" : 
                instructor.status === "INACTIVE" ? "inactive" : "retired",
        notes: instructor.notes || "",
        certificationIds: instructor.certifications.map(c => c.id),
      });
    } else {
      // 新規追加モード
      setFormData({
        lastName: "",
        firstName: "",
        lastNameKana: "",
        firstNameKana: "",
        status: "active",
        notes: "",
        certificationIds: [],
      });
    }
  }, [instructor, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadCertifications();
    }
  }, [isOpen]);

  const loadCertifications = async () => {
    try {
      setIsLoadingCertifications(true);
      const certifications = await fetchCertifications();
      // 有効な資格のみ選択可能にする
      const activeCertifications = certifications.filter(cert => cert.isActive);
      setAvailableCertifications(activeCertifications);
    } catch (error) {
      console.error("Failed to load certifications:", error);
    } finally {
      setIsLoadingCertifications(false);
    }
  };

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

  const handleCertificationToggle = (certificationId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      certificationIds: checked 
        ? [...(prev.certificationIds || []), certificationId]
        : (prev.certificationIds || []).filter(id => id !== certificationId)
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <SealCheck className="w-4 h-4 text-green-600" weight="regular" />;
      case "inactive":
        return <UserGear className="w-4 h-4 text-yellow-600" weight="regular" />;
      case "retired":
        return <UserMinus className="w-4 h-4 text-gray-600" weight="regular" />;
      default:
        return <User className="w-4 h-4" weight="regular" />;
    }
  };

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent className="h-[90vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" weight="regular" />
            {instructor ? "インストラクター編集" : "新規インストラクター"}
          </DrawerTitle>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本情報 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Info className="w-4 h-4" weight="regular" />
                基本情報
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    姓 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="田中"
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    名 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="太郎"
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastNameKana" className="text-sm font-medium">
                    セイ（カタカナ）
                  </Label>
                  <Input
                    id="lastNameKana"
                    type="text"
                    value={formData.lastNameKana}
                    onChange={(e) => setFormData({ ...formData, lastNameKana: e.target.value })}
                    placeholder="タナカ"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="firstNameKana" className="text-sm font-medium">
                    メイ（カタカナ）
                  </Label>
                  <Input
                    id="firstNameKana"
                    type="text"
                    value={formData.firstNameKana}
                    onChange={(e) => setFormData({ ...formData, firstNameKana: e.target.value })}
                    placeholder="タロウ"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* ステータス */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {getStatusIcon(formData.status)}
                ステータス
              </div>
              
              <RadioGroup
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' | 'retired' })}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active" className="cursor-pointer flex items-center gap-2 flex-1">
                    <SealCheck className="w-4 h-4 text-green-600" weight="regular" />
                    <div>
                      <div className="font-medium">有効</div>
                      <div className="text-xs text-muted-foreground">アクティブな状態</div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive" className="cursor-pointer flex items-center gap-2 flex-1">
                    <UserGear className="w-4 h-4 text-yellow-600" weight="regular" />
                    <div>
                      <div className="font-medium">休止</div>
                      <div className="text-xs text-muted-foreground">一時的に休止中</div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                  <RadioGroupItem value="retired" id="retired" />
                  <Label htmlFor="retired" className="cursor-pointer flex items-center gap-2 flex-1">
                    <UserMinus className="w-4 h-4 text-gray-600" weight="regular" />
                    <div>
                      <div className="font-medium">退職</div>
                      <div className="text-xs text-muted-foreground">退職済み</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* 保有資格 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <SealCheck className="w-4 h-4" weight="regular" />
                保有資格
              </div>
              
              {isLoadingCertifications ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span className="ml-2 text-sm text-muted-foreground">資格を読み込み中...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded-lg p-3">
                  {availableCertifications.length > 0 ? (
                    availableCertifications.map((certification) => {
                      const deptType = getDepartmentType(certification.department.name);
                      const DeptIcon = deptType === "ski" ? PersonSimpleSki : PersonSimpleSnowboard;
                      const isChecked = (formData.certificationIds || []).includes(certification.id);
                      
                      return (
                        <div
                          key={certification.id}
                          className="flex items-start space-x-3 p-2 rounded-lg hover:bg-accent"
                        >
                          <input
                            type="checkbox"
                            id={`cert-${certification.id}`}
                            checked={isChecked}
                            onChange={(e) => 
                              handleCertificationToggle(certification.id, e.target.checked)
                            }
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <div className="flex-1 space-y-1">
                            <Label
                              htmlFor={`cert-${certification.id}`}
                              className="cursor-pointer flex items-center gap-2 text-sm font-medium"
                            >
                              <DeptIcon 
                                className={`w-4 h-4 ${
                                  deptType === "ski" 
                                    ? "text-ski-600 dark:text-ski-400" 
                                    : "text-snowboard-600 dark:text-snowboard-400"
                                }`} 
                                weight="regular" 
                              />
                              {certification.shortName || certification.name}
                            </Label>
                            <div className="text-xs text-muted-foreground">
                              {certification.organization} - {certification.name}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center py-4 text-muted-foreground">
                      選択可能な資格がありません
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* 備考 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Info className="w-4 h-4" weight="regular" />
                備考
              </div>
              
              <div className="space-y-2">
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="その他の特記事項があれば入力してください"
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>
          </form>
        </ScrollArea>

        <DrawerFooter className="flex-shrink-0">
          <div className="flex gap-2 w-full">
            <DrawerClose asChild className="flex-1">
              <Button variant="outline" disabled={isSubmitting}>
                キャンセル
              </Button>
            </DrawerClose>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.lastName.trim() || !formData.firstName.trim()}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  保存中...
                </>
              ) : (
                "保存"
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}