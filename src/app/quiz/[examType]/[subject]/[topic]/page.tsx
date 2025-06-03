
"use client";

import { useEffect, use } from 'react';
import { useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import QuizPageContent from '@/components/quiz/QuizPageContent';
import { EXAM_TYPES, SUBJECTS, TOPICS } from '@/lib/questions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain } from 'lucide-react';

interface QuizPageParams {
  params: { // This is the shape of the resolved params
    examType: string;
    subject: string;
    topic: string;
  };
}

export default function QuizPage({ params: paramsProp }: QuizPageParams) {
  const params = use(paramsProp); // Unwrap the params
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const { examType, subject, topic } = params; // Use unwrapped params

  const exam = EXAM_TYPES.find(e => e.id === examType);
  const subjectData = SUBJECTS.find(s => s.id === subject && s.examType === examType);
  const topicData = TOPICS.find(t => t.id === topic && t.subject === subject && t.examType === examType);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
    // Set document title after authentication check and data is available
    if (currentUser) {
      if (exam && subjectData && topicData) {
        document.title = `${topicData.name} Quizi | ${subjectData.name} | ${exam.name} - QuizWhiz`;
      } else if (exam && subjectData) { // If topicData is missing but others are present
        document.title = `Konu Bulunamadı | ${subjectData.name} | ${exam.name} - QuizWhiz`;
      }
       else {
        document.title = 'Quiz Bulunamadı - QuizWhiz';
      }
    }
  }, [currentUser, loading, router, exam, subjectData, topicData, examType, subject, topic]);


  if (loading || (!loading && !currentUser && (!exam || !subjectData || !topicData ))) { // Added checks for exam/subjectData/topicData
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Brain className="w-12 h-12 animate-pulse text-primary" />
        <p className="ml-2 text-lg">Yükleniyor...</p>
      </div>
    );
  }

  if (!exam || !subjectData || !topicData) {
    notFound();
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline" size="sm">
          <Link href={`/quiz/${examType}/${subject}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Konu Seçimine Dön
          </Link>
        </Button>
      </div>
       {topicData && subjectData && exam && (
        <div className="text-center mb-8 p-6 bg-card rounded-lg shadow">
          <h1 className="text-3xl font-headline font-bold text-primary">{topicData.name}</h1>
          <p className="text-md text-muted-foreground">{subjectData.name} ({exam.name})</p>
        </div>
      )}
      <QuizPageContent examType={examType} subject={subject} topic={topic} />
    </div>
  );
}
