
"use client";

import { ListChecks } from 'lucide-react'; // Changed from Award

interface ScoreDisplayProps {
  currentProgress: number; // Changed from score to currentProgress
  totalQuestions: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ currentProgress, totalQuestions }) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-card rounded-lg shadow">
      <ListChecks className="h-6 w-6 text-primary" /> {/* Changed icon */}
      <p className="text-lg font-semibold text-foreground">
        Soru: <span className="text-primary font-bold">{currentProgress}</span> / {totalQuestions}
      </p>
    </div>
  );
};

export default ScoreDisplay;
