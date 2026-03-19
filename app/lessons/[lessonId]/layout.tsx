import type { Metadata } from "next";
import { getLessonById } from "@/lib/lessons";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ lessonId: string }>;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { lessonId } = await params;
  const parsedId = Number.parseInt(lessonId, 10);
  const lesson = getLessonById(parsedId);

  if (!lesson) {
    return {
      title: "Lesson not found • Opus Mastery",
      description: "Browse all 12 Opus Mastery lessons from the dashboard.",
    };
  }

  const title = `Lesson ${lesson.id}: ${lesson.title} • Opus Mastery`;
  const description = lesson.description;

  const lessonUrl = `/lessons/${lesson.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: lessonUrl,
    },
    openGraph: {
      title,
      description,
      url: lessonUrl,
      images: [{ url: "/api/og" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/api/og"],
    },
  };
}

export default function LessonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
