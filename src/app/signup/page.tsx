
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Brain, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import type { AuthError } from 'firebase/auth';

const signupSchema = z.object({
  email: z.string().email({ message: "Lütfen geçerli bir e-posta adresi girin." }),
  password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır." }),
  confirmPassword: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor.",
  path: ["confirmPassword"], // Hatanın hangi alanda gösterileceği
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signupWithEmail, currentUser, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  useEffect(() => {
    if (!loading && currentUser) {
      router.push('/'); 
    }
  }, [currentUser, loading, router]);

  const onSubmit: SubmitHandler<SignupFormValues> = async (data) => {
    setError(null);
    const result = await signupWithEmail(data.email, data.password);
    if ((result as AuthError).code) {
        const errorCode = (result as AuthError).code;
        if (errorCode === 'auth/email-already-in-use') {
            setError("Bu e-posta adresi zaten kullanımda.");
        } else if (errorCode === 'auth/invalid-email') {
            setError("Geçersiz e-posta formatı.");
        } else if (errorCode === 'auth/weak-password') {
            setError("Şifre çok zayıf. Lütfen daha güçlü bir şifre seçin.");
        }
        else {
            setError("Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
            console.error("Firebase signup error:", result);
        }
    } else {
      router.push('/'); // Başarılı kayıtta ana sayfaya yönlendir
    }
  };

  if (loading) {
      return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Brain className="w-12 h-12 animate-pulse text-primary" /> <p className="ml-2 text-lg">Yükleniyor...</p></div>;
  }
   if (!loading && currentUser) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100 dark:from-gray-800 dark:via-slate-900 dark:to-neutral-900 p-4">
      <div className="w-full max-w-4xl flex rounded-xl shadow-2xl overflow-hidden bg-card">
        {/* Sol Bölüm - Tanıtım (Mobilde Gizli) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-purple-700 p-8 text-white flex-col justify-center items-center text-center space-y-6 relative overflow-hidden">
           <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
           <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full animate-pulse delay-200"></div>
           <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-white/10 rounded-full animate-pulse delay-500"></div>
          <Brain className="w-20 h-20 mb-4 z-10" />
          <h2 className="text-3xl font-headline font-bold z-10">YKSQuiz'e Katıl!</h2>
          <p className="text-lg leading-relaxed z-10">
            Binlerce soruya eriş, potansiyelini keşfet ve YKS'de başarıya ulaş! 🚀
          </p>
        </div>

        {/* Sağ Bölüm - Kayıt Formu */}
        <div className="w-full md:w-1/2 p-6 sm:p-8">
          <Card className="border-none shadow-none">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl sm:text-3xl font-headline text-primary">Hesap Oluştur</CardTitle>
              <CardDescription>Yeni bir hesap oluşturarak YKSQuiz'e başla.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-posta</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="ornek@eposta.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şifre</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              {...field} 
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
                              onClick={() => setShowPassword(!showPassword)}
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şifre Tekrar</FormLabel>
                        <FormControl>
                           <div className="relative">
                            <Input 
                              type={showConfirmPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              {...field} 
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              tabIndex={-1}
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {error && (
                     <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-md flex items-center gap-2 animate-in fade-in duration-300">
                      <AlertTriangle size={18} />
                      <span>{error}</span>
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full min-h-[45px] bg-gradient-to-r from-primary to-purple-700 hover:from-primary/90 hover:to-purple-700/90 text-primary-foreground text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
                    disabled={form.formState.isSubmitting || loading}
                  >
                    {form.formState.isSubmitting || loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-center text-sm">
              <p className="text-muted-foreground">
                Zaten hesabın var mı?{' '}
                <Link href="/login" passHref>
                  <Button variant="link" className="p-0 h-auto text-primary hover:underline">Giriş Yap</Button>
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

    