"use client";

import Image from "next/image";
import type { CertificationCardProps } from "./types";
import { getDepartmentType } from "./utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CertificationCard({ certification, onEdit }: CertificationCardProps) {
  const departmentInfo = {
    ski: {
      image: "/images/ski_image.webp",
      name: "スキー",
      gradient: "from-blue-600 via-blue-500 to-cyan-400",
    },
    snowboard: {
      image: "/images/snowboard_image.webp",
      name: "スノーボード",
      gradient: "from-orange-500 via-amber-500 to-yellow-400",
    },
  };

  // department.nameから部門タイプを判定
  const deptType = getDepartmentType(certification.department.name);
  const dept = departmentInfo[deptType] || {
    image: "/images/ski_image.webp",
    name: "スキー",
    gradient: "from-gray-600 to-gray-400",
  };
  const isActive = certification.isActive;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/20",
        isActive ? "opacity-100" : "opacity-75 grayscale"
      )}
      onClick={() => onEdit(certification)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(certification);
        }
      }}
    >
      {/* Background Image with Overlay */}
      <CardHeader className="relative h-36 md:h-40 w-full p-0">
        <Image
          src={dept.image}
          alt={`${dept.name}の画像`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 320px"
          loading="lazy"
        />

        {/* Dynamic Gradient Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${dept.gradient} opacity-80 mix-blend-multiply`}
        />

        {/* Noise Texture Overlay for Premium Feel */}
        <div
          className="absolute inset-0 bg-black/10 opacity-60"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <Badge variant="secondary" className="bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30">
            <div className="w-1.5 h-1.5 rounded-full bg-white mr-2" />
            {dept.name}
          </Badge>

          {!isActive && (
            <Badge variant="destructive" className="bg-gray-500/90 backdrop-blur-sm border border-gray-400/50">
              無効
            </Badge>
          )}
        </div>

        {/* Title with enhanced visibility */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <CardTitle className="text-lg md:text-xl font-bold text-white mb-1 leading-tight line-clamp-2 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)] [text-shadow:1px_1px_2px_rgba(0,0,0,0.6),0px_0px_8px_rgba(0,0,0,0.4)]">
            {certification.name}
          </CardTitle>
        </div>

        {/* Enhanced bottom fade gradient for text readability */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </CardHeader>

      {/* Compact Content Section */}
      <CardContent className="relative p-3 md:p-4">
        {/* Organization and metadata */}
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-2">
            <div className="w-1 h-3 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
            <span className="text-sm font-medium text-card-foreground">{certification.organization}</span>
            {certification.shortName && (
              <>
                <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                <span className="text-xs text-muted-foreground font-mono">{certification.shortName}</span>
              </>
            )}
          </div>
        </div>

        {/* Compact Description */}
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-3">
          {certification.description || "詳細な説明はまだ登録されていません。"}
        </p>

        {/* Bottom decoration line */}
        <div className={`h-0.5 w-full rounded-full bg-gradient-to-r ${dept.gradient} opacity-60`} />

        {/* Hover indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-card to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </CardContent>
    </Card>
  );
}
