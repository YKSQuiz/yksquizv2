
"use client";
import React from 'react';
import { cn } from '@/lib/utils';

interface XPBarProps {
  currentXP: number;
  level: number; // Bu, profile/page.tsx'de hesaplanan dinamik seviyedir
  xpPerLevel?: number; // Opsiyonel, varsayılanı 250
  className?: string;
}

const XPBar: React.FC<XPBarProps> = ({ currentXP, level, xpPerLevel = 250, className }) => {
  // Mevcut seviyenin başlangıç XP'si
  const xpForCurrentLevelStart = (level - 1) * xpPerLevel;
  // Mevcut seviyede kazanılan XP
  const xpEarnedInCurrentLevel = currentXP - xpForCurrentLevelStart;
  
  // Bir sonraki seviyeye ulaşmak için gereken toplam XP (mevcut seviye aralığı için)
  // Bu her zaman xpPerLevel olacak (örneğin 250)
  const targetXpForLevelSpan = xpPerLevel;

  const percentage = targetXpForLevelSpan > 0 
    ? Math.min((xpEarnedInCurrentLevel / targetXpForLevelSpan) * 100, 100) 
    : 0;

  return (
    <div className={cn("flex flex-col items-start w-full flex-1", className)}>
        <div className="flex justify-between w-full text-xs mb-0.5">
            <span className="font-semibold text-foreground">Seviye {level} XP</span>
            {/* Mevcut seviyedeki ilerlemeyi göster: Kazanılan / Gereken */}
            <span className="text-muted-foreground">{xpEarnedInCurrentLevel} / {targetXpForLevelSpan}</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden relative shadow-inner">
            <div
                className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--primary)))] animate-glowPulse transition-[width] duration-700 ease-in-out"
                style={{ width: `${percentage}%` }}
            />
        </div>
    </div>
  );
};

export default XPBar;
