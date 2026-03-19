import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificate • Opus Mastery",
  description: "Generate, download, and share your Opus Mastery completion certificate.",
  alternates: {
    canonical: "/certificate",
  },
  openGraph: {
    title: "Certificate • Opus Mastery",
    description: "Generate, download, and share your Opus Mastery completion certificate.",
    url: "/certificate",
    images: [{ url: "/api/og" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Certificate • Opus Mastery",
    description: "Generate, download, and share your Opus Mastery completion certificate.",
    images: ["/api/og"],
  },
};

export default function CertificateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
