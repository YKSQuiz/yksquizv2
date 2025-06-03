
"use client";

import { useEffect, use } from 'react';
import { useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import QuizCard from '@/components/QuizCard';
import AnimatedTitle from '@/components/AnimatedTitle';
import { EXAM_TYPES, SUBJECTS } from '@/lib/questions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExamTypePageProps {
  params: { // This is the shape of the resolved params
    examType: string;
  };
}

export default function ExamTypePage({ params: paramsProp }: ExamTypePageProps) {
  const params = use(paramsProp); // Unwrap the params
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const { examType } = params; // Use unwrapped params

  const currentExam = EXAM_TYPES.find((e) => e.id === examType);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
    // Set document title after authentication check and data is available
    if (currentUser && currentExam) {
      document.title = `${currentExam.name} - Ders Seçimi - QuizWhiz`;
    } else if (currentUser && !currentExam) {
      document.title = 'Sınav Bulunamadı - QuizWhiz';
    }
  }, [currentUser, loading, router, currentExam, examType]);

  if (loading || (!loading && !currentUser && !currentExam)) { // Added !currentExam to ensure it doesn't flash content before redirect
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Brain className="w-12 h-12 animate-pulse text-primary" />
        <p className="ml-2 text-lg">Yükleniyor...</p>
      </div>
    );
  }

  if (!currentExam) {
    // This will only be reached if the user is authenticated but the examType is invalid
    // or if currentUser is null and loading is false (already handled by redirect)
    notFound();
  }

  const availableSubjects = SUBJECTS.filter((s) => s.examType === examType);

  return (
    <div className={cn("space-y-8", "bg-subject-page-gradient", "py-6 px-4 md:px-0 rounded-lg")}>
      <div className="flex items-center justify-between mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Sınav Türlerine Dön
            </Link>
          </Button>
        </div>

      <div className="p-4 bg-card text-center rounded-lg shadow-md animate-in fade-in slide-in-from-top-4 duration-500 delay-100 mb-6">
        <p className="text-lg font-medium text-foreground">
          Her gün çöz bir test, bir adım daha yaklaş başarıya! <span role="img" aria-label="target">🎯</span>
        </p>
      </div>

      {availableSubjects.length === 0 ? (
         <div className="text-center space-y-4 py-10">
          <h1 className="text-3xl font-headline font-bold text-destructive">Ders Bulunamadı</h1>
          <p className="text-muted-foreground">
            Seçtiğiniz {currentExam.name} sınav türü için şu anda tanımlı ders bulunmamaktadır.
          </p>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Ana Sayfaya Dön
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <section className="text-center py-6 bg-card shadow-md rounded-lg">
            <AnimatedTitle 
              text={currentExam.name} 
              className="text-3xl font-headline font-bold text-primary" 
              typingSpeed={80}
            />
            <p className="text-lg text-muted-foreground mt-2">
              Hangi derste kendini test etmek istersin? Eksiklerini kapat, güçlü yanlarını pekiştir!
            </p>
          </section>
          
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableSubjects.map((subject) => (
                <QuizCard
                  key={subject.id}
                  title={subject.name}
                  description={subject.description}
                  href={`/quiz/${examType}/${subject.id}`}
                  icon={subject.icon}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
