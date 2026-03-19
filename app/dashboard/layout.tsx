import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard • Opus Mastery",
  description: "Track your lesson progress, achievements, and current Opus challenge.",
  alternates: {
    canonical: "/dashboard",
  },
  openGraph: {
    title: "Dashboard • Opus Mastery",
    description: "Track your lesson progress, achievements, and current Opus challenge.",
    url: "/dashboard",
    images: [{ url: "/api/og" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard • Opus Mastery",
    description: "Track your lesson progress, achievements, and current Opus challenge.",
    images: ["/api/og"],
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
