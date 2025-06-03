
"use client";

import { useEffect, use } from 'react';
import { useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import QuizCard from '@/components/QuizCard';
import { EXAM_TYPES, SUBJECTS, TOPICS } from '@/lib/questions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain } from 'lucide-react';

interface SubjectPageProps {
  params: { // This is the shape of the resolved params
    examType: string;
    subject: string;
  };
}

export default function SubjectPage({ params: paramsProp }: SubjectPageProps) {
  const params = use(paramsProp); // Unwrap the params
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const { examType, subject: subjectId } = params; // Use unwrapped params

  const currentExam = EXAM_TYPES.find((e) => e.id === examType);
  const currentSubject = SUBJECTS.find((s) => s.id === subjectId && s.examType === examType);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
    // Set document title after authentication check and data is available
    if (currentUser && currentExam && currentSubject) {
      document.title = `${currentSubject.name} - Konu Seçimi - QuizWhiz`;
    } else if (currentUser && (!currentExam || !currentSubject)) { 
      document.title = 'Konu Bulunamadı - QuizWhiz';
    }
  }, [currentUser, loading, router, currentExam, currentSubject, examType, subjectId]);

  if (loading || (!loading && !currentUser && (!currentExam || !currentSubject))) { // Added checks for currentExam/currentSubject
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Brain className="w-12 h-12 animate-pulse text-primary" />
        <p className="ml-2 text-lg">Yükleniyor...</p>
      </div>
    );
  }

  if (!currentExam || !currentSubject) {
    notFound();
  }

  const availableTopics = TOPICS.filter((t) => t.subject === subjectId && t.examType === examType);

  if (availableTopics.length === 0) {
     return (
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-headline font-bold text-destructive">Konu Bulunamadı</h1>
        <p className="text-muted-foreground">
          Seçtiğiniz {currentSubject.name} dersi için şu anda tanımlı konu bulunmamaktadır.
        </p>
        <Button asChild variant="outline">
          <Link href={`/quiz/${examType}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Ders Seçimine Dön
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <Button asChild variant="outline" size="sm">
          <Link href={`/quiz/${examType}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Ders Seçimine Dön
          </Link>
        </Button>
      </div>
      <section className="text-center py-6 bg-card shadow-md rounded-lg">
        <h1 className="text-3xl font-headline font-bold text-primary">{currentSubject.name}</h1>
        <p className="text-lg text-muted-foreground">({currentExam.name}) - Hangi konudan soru çözmek istersin?</p>
      </section>
      
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {availableTopics.map((topic) => (
            <QuizCard
              key={topic.id}
              title={topic.name}
              description={topic.description}
              href={`/quiz/${examType}/${subjectId}/${topic.id}`}
              icon={topic.icon}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
