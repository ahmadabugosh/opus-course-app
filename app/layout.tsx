import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ProgressProvider } from "@/components/progress-provider";
import { AnalyticsTracker } from "@/components/analytics-tracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://opus-course.learnopenclaw.ai";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Opus Mastery — Gamified AI Workflow Course",
  description:
    "Master Opus through a 12-lesson gamified course with videos, hands-on challenges, achievements, and certificate generation.",
  openGraph: {
    title: "Opus Mastery",
    description: "A 12-lesson gamified course to become an Opus automation expert.",
    url: appUrl,
    siteName: "Opus Mastery",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Opus Mastery",
    description: "Learn Opus with 12 practical lessons and earn your certificate.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ProgressProvider>
          <AnalyticsTracker />
          <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <Link href="/" className="text-base font-semibold tracking-tight">
                🎓 Opus Mastery
              </Link>
              <nav className="flex items-center gap-3 text-sm text-muted">
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link href="/lessons/1" className="hover:text-foreground transition-colors">
                  Lessons
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border/80">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <p>Built for practical automation mastery in Opus.</p>
              <p>12 lessons • Zero signup friction • Certificate at completion</p>
            </div>
          </footer>
        </ProgressProvider>
      </body>
    </html>
  );
}
