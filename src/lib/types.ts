
import type { LucideIcon } from 'lucide-react';

export interface AnswerOption {
  text: string;
  id: string;
}

export interface Question {
  id: string;
  text: string;
  options: AnswerOption[];
  correctAnswerId: string;
  topic: string;
  subject: string;
  examType: string;
}

export interface ExamType {
  id: string;
  name: string;
  icon?: LucideIcon;
  description?: string;
  imageUrl?: string;
  dataAiHint?: string; // Added dataAiHint for images
}

export interface Subject {
  id: string;
  name: string;
  examType: string;
  icon?: LucideIcon;
  description?: string;
}

export interface Topic {
  id: string;
  name: string;
  subject: string;
  examType: string; // Added examType here for consistency in filtering TOPICS
  icon?: LucideIcon;
  description?: string;
}
