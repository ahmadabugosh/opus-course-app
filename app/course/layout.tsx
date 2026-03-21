import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard • Opus AppliedAI Mastery Course",
  description: "Track your lesson progress, achievements, and current Opus challenge.",
  alternates: {
    canonical: "/course",
  },
  openGraph: {
    title: "Dashboard • Opus AppliedAI Mastery Course",
    description: "Track your lesson progress, achievements, and current Opus challenge.",
    url: "/course",
    images: [{ url: "/api/og" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard • Opus AppliedAI Mastery Course",
    description: "Track your lesson progress, achievements, and current Opus challenge.",
    images: ["/api/og"],
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
