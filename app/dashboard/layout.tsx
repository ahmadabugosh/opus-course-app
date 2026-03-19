import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard • Opus Mastery",
  description: "Track your lesson progress, achievements, and current Opus challenge.",
  openGraph: {
    title: "Dashboard • Opus Mastery",
    description: "Track your lesson progress, achievements, and current Opus challenge.",
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
