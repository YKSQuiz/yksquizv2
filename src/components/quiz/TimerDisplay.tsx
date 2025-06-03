
"use client";

import { Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  timeLeft: number;
  totalTime: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, totalTime }) => {
  const progress = (timeLeft / totalTime) * 100;
  
  let timeColorClass;
  let progressBgClass;

  if (timeLeft <= 30) { // 30 saniye veya daha az - Kırmızı
    timeColorClass = 'text-destructive';
    progressBgClass = 'bg-destructive';
  } else if (timeLeft <= 120) { // 120 saniye (2 dakika) veya daha az - Turuncu
    timeColorClass = 'text-[hsl(var(--chart-1))]'; 
    progressBgClass = 'bg-[hsl(var(--chart-1))]';
  } else { // Başlangıç durumu - Mor
    timeColorClass = 'text-primary'; 
    progressBgClass = 'bg-primary'; // Önceden bg-accent idi, şimdi ana renk
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-card rounded-lg shadow">
      <Timer className={cn("h-6 w-6", timeColorClass)} />
      <div className="flex-grow">
        <p className={cn("text-lg font-semibold tabular-nums", timeColorClass)}>
          Kalan Süre: {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
        </p>
        <div className="w-full bg-muted rounded-full h-2.5 mt-1">
          <div
            className={cn(
              "h-2.5 rounded-full transition-all duration-500 ease-linear",
              progressBgClass
            )}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;

