
import type { Metadata } from 'next';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from '@/contexts/AuthContext'; // AuthProvider'ı içe aktar

export const metadata: Metadata = {
  title: 'QuizWhiz - Test Your Knowledge',
  description: 'Interactive Quiz Application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider> {/* AuthProvider ile sarmala */}
            <SiteHeader />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Toaster />
            <footer className="text-center p-4 text-sm text-muted-foreground border-t">
              QuizWhiz &copy; {new Date().getFullYear()}
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
