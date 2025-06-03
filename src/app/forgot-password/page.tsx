
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
import { Brain, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { AuthError } from 'firebase/auth';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Lütfen geçerli bir e-posta adresi girin." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resetPassword, currentUser, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    if (!loading && currentUser) {
      router.push('/'); 
    }
  }, [currentUser, loading, router]);

  const onSubmit: SubmitHandler<ForgotPasswordFormValues> = async (data) => {
    setError(null);
    setSuccessMessage(null);
    const result = await resetPassword(data.email);

    if (result && (result as AuthError).code) {
      const errorCode = (result as AuthError).code;
       if (errorCode === 'auth/user-not-found') {
        setError("Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.");
      } else if (errorCode === 'auth/invalid-email') {
        setError("Geçersiz e-posta formatı.");
      }
       else {
        setError("Şifre sıfırlama e-postası gönderilirken bir hata oluştu.");
        console.error("Firebase reset password error:", result);
      }
    } else {
      setSuccessMessage(`Şifre sıfırlama bağlantısı ${data.email} adresine gönderildi. Lütfen e-postanızı kontrol edin.`);
      form.reset();
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
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl font-headline text-primary">Şifremi Unuttum</CardTitle>
            <CardDescription>Hesabınızla ilişkili e-posta adresini girin.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-md flex items-center gap-2 animate-in fade-in duration-300">
                    <AlertTriangle size={18} />
                    <span>{error}</span>
                  </div>
                )}
                {successMessage && (
                  <div className="p-3 bg-accent/10 border border-accent/30 text-accent-foreground dark:text-green-300 text-sm rounded-md flex items-center gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 size={18} className="text-accent dark:text-green-400" />
                    <span>{successMessage}</span>
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full min-h-[45px] bg-gradient-to-r from-primary to-purple-700 hover:from-primary/90 hover:to-purple-700/90 text-primary-foreground text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
                  disabled={form.formState.isSubmitting || loading}
                >
                  {form.formState.isSubmitting || loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center text-sm">
            <Link href="/login" passHref>
              <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">Giriş Sayfasına Dön</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

    