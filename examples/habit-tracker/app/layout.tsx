import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import AppInitializer from '@/components/AppInitializer';

export const metadata: Metadata = {
  title: 'HabitForge – Build Lasting Habits',
  description:
    'Track your daily habits, build streaks, and visualize your progress with HabitForge.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider>
          <AppInitializer>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <AuthGuard>
                <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                  {children}
                </main>
                <footer className="border-t border-gray-200 dark:border-gray-700 py-4">
                  <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                    HabitForge &mdash; Build better habits, one day at a time
                  </p>
                </footer>
              </AuthGuard>
            </div>
          </AppInitializer>
        </ThemeProvider>
      </body>
    </html>
  );
}
