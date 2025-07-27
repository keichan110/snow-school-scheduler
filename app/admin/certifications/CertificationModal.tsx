"use client";

import { useState, useEffect } from "react";
import { X, Info, FileText, PersonSimpleSki, PersonSimpleSnowboard } from "@phosphor-icons/react";
import type { CertificationModalProps, CertificationFormData } from "./types";
import { getDepartmentType } from "./utils";

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

  if (!isOpen) return null;

  return (
    <div className="modal show">
      <div className="modal-content">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {certification ? "資格編集" : "新しい資格を追加"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" weight="regular" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 基本情報セクション */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary-600" weight="regular" />
              基本情報
            </h3>

            <div className="form-group">
              <label htmlFor="certificationName" className="form-label required">
                資格名称
              </label>
              <input
                type="text"
                id="certificationName"
                className="form-input"
                placeholder="例: スキー指導員"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <div className="help-text">正式な資格名称を入力してください</div>
            </div>

            <div className="form-group">
              <label htmlFor="shortName" className="form-label">
                略称
              </label>
              <input
                type="text"
                id="shortName"
                className="form-input"
                placeholder="例: 指導員"
                value={formData.shortName}
                onChange={(e) => setFormData((prev) => ({ ...prev, shortName: e.target.value }))}
              />
              <div className="help-text">シフト表示などで使用する短い名称（省略可）</div>
            </div>

            <div className="form-group">
              <label className="form-label required">部門</label>
              <div className="radio-group">
                <label
                  className={`radio-option ski ${formData.department === "ski" ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="department"
                    value="ski"
                    checked={formData.department === "ski"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        department: e.target.value as "ski" | "snowboard",
                      }))
                    }
                    required
                  />
                  <PersonSimpleSki className="w-5 h-5" weight="regular" />
                  <span className="font-medium">スキー</span>
                </label>
                <label
                  className={`radio-option snowboard ${
                    formData.department === "snowboard" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="department"
                    value="snowboard"
                    checked={formData.department === "snowboard"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        department: e.target.value as "ski" | "snowboard",
                      }))
                    }
                    required
                  />
                  <PersonSimpleSnowboard className="w-5 h-5" weight="regular" />
                  <span className="font-medium">スノーボード</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="organization" className="form-label required">
                発行組織
              </label>
              <input
                type="text"
                id="organization"
                className="form-input"
                placeholder="例: SAJ（全日本スキー連盟）"
                value={formData.organization}
                onChange={(e) => setFormData((prev) => ({ ...prev, organization: e.target.value }))}
                required
              />
              <div className="help-text">資格を発行した組織名を入力してください</div>
            </div>
          </div>

          {/* 詳細情報セクション */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" weight="regular" />
              詳細情報
            </h3>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                説明・備考
              </label>
              <textarea
                id="description"
                className="form-input form-textarea"
                rows={4}
                placeholder="資格の詳細説明、取得条件、有効期限などを記載してください"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
              <div className="help-text">資格の詳細情報や注意事項などを記載（省略可）</div>
            </div>

            <div className="form-group">
              <label className="form-label">有効</label>
              <div className="toggle-container">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={formData.status === "active"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.checked ? "active" : "inactive",
                      }))
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="help-text">無効にした資格は新規割り当てができなくなります</div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-tl from-blue-100 via-blue-300 to-indigo-400  text-white rounded-lg hover:shadow-xl hover:scale-110 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal {
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-content {
          background: white;
          padding: 32px;
          border-radius: 16px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }

        .form-label.required::after {
          content: " *";
          color: #dc2626;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .radio-group {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
          min-width: 120px;
        }

        .radio-option:hover {
          border-color: #3b82f6;
          background: #f8faff;
        }

        .radio-option.selected {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .radio-option.ski.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .radio-option.snowboard.selected {
          border-color: #f59e0b;
          background: #fefbf2;
          color: #d97706;
        }

        .radio-option input[type="radio"] {
          display: none;
        }

        .help-text {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }

        .toggle-container {
          display: flex;
          align-items: center;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
          cursor: pointer;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #9ca3af;
          border-radius: 12px;
          transition: 0.3s;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          border-radius: 50%;
          transition: 0.3s;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .toggle-switch input:checked + .toggle-slider {
          background-color: #3b82f6;
        }

        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(24px);
        }

        @media (max-width: 768px) {
          .modal-content {
            padding: 20px;
            width: 95%;
          }

          .radio-group {
            flex-direction: column;
          }

          .radio-option {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}
