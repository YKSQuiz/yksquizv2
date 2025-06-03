
import QuizCard from '@/components/QuizCard';
import { EXAM_TYPES } from '@/lib/questions';
import type { Metadata } from 'next';
import { BookOpenCheck, Zap, Target } from 'lucide-react';

export const metadata: Metadata = {
  title: 'YKSQuiz - Bilgini Test Et!',
  description: 'YKS formatındaki sınavlarla kendini dene. Çeşitli ders ve konularda interaktif quizlerle öğrenmeye başla.',
};

export default function HomePage() {
  return (
    <div className="flex flex-col items-center text-center space-y-12 py-8 md:py-16 bg-quiz-gradient">
      <div className="animate-in fade-in slide-in-from-top-12 duration-700">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">
          YKSQuiz Dünyasına Adım At!
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Binlerce soru arasından seviyene uygun olanları çöz, eksiklerini gör ve YKS'ye bir adım önde başla!
          Hangi sınav türüyle başlamak istersin?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-5xl px-4 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
        {EXAM_TYPES.map((exam) => (
          <QuizCard
            key={exam.id}
            title={exam.name}
            description={exam.description}
            href={`/quiz/${exam.id}`}
            icon={exam.icon}
            // imageUrl ve dataAiHint, önceki isteğe göre kasıtlı olarak çıkarıldı
            // Eğer QuizCard'ların görsellerle gösterilmesi istenirse, bu proplar geri eklenebilir
            // ve EXAM_TYPES içinde imageUrl tanımlanmalıdır.
          />
        ))}
      </div>

      <section className="w-full max-w-3xl space-y-8 pt-12 animate-in fade-in duration-700 delay-500">
        <h2 className="text-3xl font-headline font-semibold text-primary">Neden YKSQuiz?</h2>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-card rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <BookOpenCheck className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Kapsamlı İçerik</h3>
            <p className="text-muted-foreground text-sm">
              TYT ve AYT için tüm ders ve konularda binlerce güncel soru.
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <Zap className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Anında Geri Bildirim</h3>
            <p className="text-muted-foreground text-sm">
              Çözdüğün her sorunun ardından doğru ve yanlışlarını anında gör.
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <Target className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Hedef Odaklı</h3>
            <p className="text-muted-foreground text-sm">
              Zayıf olduğun konulara odaklanarak gelişimini hızlandır.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
