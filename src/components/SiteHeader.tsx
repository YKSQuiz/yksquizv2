
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, UserPlus, User } from 'lucide-react'; // User ikonunu içe aktar
import { useRouter } from 'next/navigation';

const SiteHeader = () => {
  const { currentUser, logoutUser, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    // AuthContext'teki logoutUser zaten /login'e yönlendiriyor.
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="https://placehold.co/45x45.png"
            alt="YKSQuiz Logo"
            width={45}
            height={45}
            className="group-hover:scale-105 transition-transform duration-200"
            data-ai-hint="brain logo"
          />
          <h1 className="text-xl sm:text-2xl font-headline font-bold tracking-tight group-hover:text-amber-300 transition-colors">YKSQuiz</h1>
        </Link>
        <div className="flex items-center gap-2">
          {!loading && currentUser && (
            <Button 
              asChild 
              variant="ghost" 
              size="sm" 
              className="text-primary-foreground hover:bg-primary-foreground/10 active:bg-primary-foreground/20"
            >
              <Link href="/profile">
                <User className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Profil</span>
              </Link>
            </Button>
          )}
          <ThemeSwitcher />
          {!loading && (
            <>
              {currentUser ? (
                <Button 
                  onClick={handleLogout} 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-foreground hover:bg-primary-foreground/10 active:bg-primary-foreground/20"
                >
                  <LogOut className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Çıkış Yap</span>
                </Button>
              ) : (
                <>
                  <Button 
                    asChild 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary-foreground hover:bg-primary-foreground/10 active:bg-primary-foreground/20"
                  >
                    <Link href="/login">
                      <LogIn className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Giriş Yap</span>
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary-foreground hover:bg-primary-foreground/10 active:bg-primary-foreground/20 hidden sm:flex" // Mobilde gizle, tablette/desktopta göster
                  >
                    <Link href="/signup">
                       <UserPlus className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                       <span>Kayıt Ol</span>
                    </Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
