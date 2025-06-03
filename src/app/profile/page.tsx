
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc, type Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import XPBar from '@/components/quiz/XPBar';
import EditProfileModal from '@/components/profile/EditProfileModal'; // Import the modal
import { 
  Mail, 
  User, 
  CalendarDays, 
  LogIn, 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  Brain, 
  Award,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Percent,
  BookCheck,
  Trophy,
  LogOut,
  Pencil // Import Pencil icon for edit button
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { cn } from '@/lib/utils';

interface UserStatsSummaryData {
  totalTests?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  lastQuizTitle?: string;
  lastQuizDate?: Timestamp;
  xp?: number;
  level?: number; // Firestore level, might be overridden by calculated level
}

const XP_PER_LEVEL = 250;
const calculateLevel = (xp: number | undefined): number => {
  if (xp === undefined || xp < 0) return 1;
  return Math.floor(xp / XP_PER_LEVEL) + 1;
};

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, loading: authLoading, logoutUser } = useAuth();
  const [userAuthData, setUserAuthData] = useState<FirebaseUser | null>(null);
  const [userStatsSummary, setUserStatsSummary] = useState<UserStatsSummaryData | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for modal

  useEffect(() => {
    if (authLoading) {
      setIsLoadingPage(true);
      return;
    }
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setUserAuthData(currentUser);
    
    const fetchStatsSummaryData = async () => {
      if (currentUser?.uid) {
        setIsLoadingPage(true); 
        try {
          const statsSummaryDocRef = doc(db, "users", currentUser.uid, "stats", "summary");
          const docSnap = await getDoc(statsSummaryDocRef);
          if (docSnap.exists()) {
            setUserStatsSummary(docSnap.data() as UserStatsSummaryData);
          } else {
            setUserStatsSummary({}); 
            console.log("No stats summary document found for user:", currentUser.uid);
          }
        } catch (error) {
          console.error("Error fetching user stats summary from Firestore:", error);
          setUserStatsSummary(null); 
        } finally {
          setIsLoadingPage(false); 
        }
      } else {
         setIsLoadingPage(false); 
      }
    };

    fetchStatsSummaryData();

  }, [currentUser, authLoading, router]);

  const calculatedLevel = useMemo(() => calculateLevel(userStatsSummary?.xp), [userStatsSummary?.xp]);

  useEffect(() => {
    if (userAuthData) { // Use userAuthData as it's set from currentUser
        const displayName = userAuthData.displayName || userAuthData.email?.split('@')[0] || 'Kullanıcı';
        document.title = `${displayName} (Seviye ${calculatedLevel}) Profili - YKSQuiz`;
    }
  }, [userAuthData, calculatedLevel]);


  const formatDate = (dateSource: string | Date | Timestamp | undefined) => {
    if (!dateSource) return 'Bilgi yok';
    try {
      let dateObj: Date;
      if (typeof dateSource === 'string') {
        dateObj = new Date(dateSource);
      } else if (dateSource instanceof Date) {
        dateObj = dateSource;
      } else if (dateSource && typeof dateSource === 'object' && 'seconds' in dateSource && 'nanoseconds' in dateSource) {
        dateObj = (dateSource as Timestamp).toDate();
      } else {
        return 'Geçersiz Tarih';
      }
      return dateObj.toLocaleString('tr-TR', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateSource);
      return typeof dateSource === 'string' ? dateSource : 'Hatalı Tarih Formatı';
    }
  };
  
  const getInitials = (email: string | null | undefined, name?: string | null | undefined) => {
    if (name) {
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    if (!email) return '??';
    return email.substring(0, 2).toUpperCase();
  };

  const accuracy = useMemo(() => {
    if (userStatsSummary?.correctAnswers === undefined || userStatsSummary?.wrongAnswers === undefined) return 'N/A';
    const totalAnswered = userStatsSummary.correctAnswers + userStatsSummary.wrongAnswers;
    if (totalAnswered === 0) return '0.0%';
    return `${((userStatsSummary.correctAnswers / totalAnswered) * 100).toFixed(1)}%`;
  }, [userStatsSummary]);


  if (isLoadingPage || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Brain className="w-12 h-12 animate-pulse text-primary" />
        <p className="ml-2 text-lg">Profil Yükleniyor...</p>
      </div>
    );
  }

  if (!userAuthData) {
    return null; 
  }
  
  const currentDisplayXP = userStatsSummary?.xp ?? 0;

  return (
    <>
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <Card className="shadow-2xl overflow-hidden bg-card/90 backdrop-blur-sm border-primary/20">
        <CardHeader className="bg-gradient-to-br from-primary to-purple-700 p-6 text-primary-foreground relative">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-24 w-24 border-4 border-primary-foreground/50 shadow-lg">
              <AvatarImage src={userAuthData.photoURL || undefined} alt={userAuthData.displayName || userAuthData.email || 'Kullanıcı Avatarı'} data-ai-hint="user avatar"/>
              <AvatarFallback className="text-3xl bg-primary-foreground text-primary">
                {getInitials(userAuthData.email, userAuthData.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-grow">
              <CardTitle className="text-3xl md:text-4xl font-headline">{userAuthData.displayName || userAuthData.email?.split('@')[0] || 'Kullanıcı'}</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-md mt-1">{userAuthData.email}</CardDescription>
              {(userStatsSummary?.xp !== undefined) && ( 
                <div className="mt-2 inline-flex items-center gap-2 bg-primary-foreground/20 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium shadow">
                  <Trophy size={18} />
                  <span>Seviye {calculatedLevel}</span>
                </div>
              )}
            </div>
            <Button variant="outline" size="icon" onClick={() => setIsEditModalOpen(true)} className="absolute top-4 right-4 sm:static sm:self-start bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground">
                <Pencil className="h-5 w-5" />
                <span className="sr-only">Profili Düzenle</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">

          {userStatsSummary?.xp !== undefined && (
            <section>
              <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                Deneyim ve Seviye
              </h3>
              <div className="p-4 bg-muted/50 rounded-lg shadow-inner">
                <XPBar 
                  currentXP={currentDisplayXP} 
                  level={calculatedLevel}
                  xpPerLevel={XP_PER_LEVEL}
                />
              </div>
            </section>
          )}
          
          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Quiz İstatistikleri
            </h3>
            {userStatsSummary && (userStatsSummary.totalTests !== undefined || userStatsSummary.correctAnswers !== undefined || userStatsSummary.wrongAnswers !== undefined) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoCard icon={ClipboardList} label="Toplam Test" value={userStatsSummary.totalTests ?? 0} />
                <InfoCard icon={CheckCircle2} label="Doğru Cevaplar" value={userStatsSummary.correctAnswers ?? 0} className="text-accent dark:text-green-400" />
                <InfoCard icon={XCircle} label="Yanlış Cevaplar" value={userStatsSummary.wrongAnswers ?? 0} className="text-destructive dark:text-red-400" />
                <InfoCard icon={Percent} label="Doğruluk" value={accuracy} />
                {userStatsSummary.lastQuizTitle && (
                  <InfoCard icon={BookCheck} label="Son Çözülen Test" value={userStatsSummary.lastQuizTitle} isText={true} />
                )}
                {userStatsSummary.lastQuizDate && (
                  <InfoCard icon={CalendarDays} label="Son Test Tarihi" value={formatDate(userStatsSummary.lastQuizDate)} isText={true} />
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic p-4 bg-muted/30 rounded-md">
                Henüz quiz istatistiğiniz bulunmamaktadır. Test çözmeye başlayarak istatistiklerinizi oluşturabilirsiniz!
              </p>
            )}
          </section>

          <Separator />

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              Hesap Bilgileri
            </h3>
            <div className="space-y-3">
              <InfoItem icon={ShieldCheck} label="Kullanıcı ID (UID)" value={userAuthData.uid} breakValue />
              <InfoItem icon={Mail} label="E-posta" value={userAuthData.email || 'Belirtilmemiş'} />
              <InfoItem icon={CalendarDays} label="Kayıt Tarihi" value={formatDate(userAuthData.metadata.creationTime)} />
              <InfoItem icon={LogIn} label="Son Giriş Tarihi" value={formatDate(userAuthData.metadata.lastSignInTime)} />
            </div>
          </section>
          
          <Separator />

           <section>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Kazanılan Rozetler
            </h3>
            <p className="text-sm text-muted-foreground italic p-4 bg-muted/30 rounded-md">
              Rozet sistemi yakında aktif olacak. Başarılarını burada sergileyebileceksin!
            </p>
          </section>

        </CardContent>
        <CardFooter className="p-6 border-t flex justify-end">
            <Button onClick={logoutUser} variant="destructive">
                <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
            </Button>
        </CardFooter>
      </Card>
    </div>
    <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={userAuthData} 
    />
    </>
  );
}

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  breakValue?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, value, breakValue = false }) => (
  <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg shadow-sm hover:bg-muted/70 transition-colors">
    <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className={cn("text-sm font-semibold text-foreground", breakValue && "break-all")}>{value}</p>
    </div>
  </div>
);

interface InfoCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  className?: string;
  isText?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, label, value, className, isText = false }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-muted/40 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center h-full">
    <Icon className={cn("h-8 w-8 mb-2 text-primary", className && isText ? "" : className)} />
    <p className="text-xs text-muted-foreground font-medium mb-0.5">{label}</p>
    <p className={cn("text-lg font-bold text-foreground", className)}>{value}</p>
  </div>
);
    
