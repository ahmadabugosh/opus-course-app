import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificate • Opus Mastery",
  description: "Generate, download, and share your Opus Mastery completion certificate.",
  openGraph: {
    title: "Certificate • Opus Mastery",
    description: "Generate, download, and share your Opus Mastery completion certificate.",
  },
};

export default function CertificateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
