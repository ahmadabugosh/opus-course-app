import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { all, get } from '@/lib/db';
import { getLearnerTitle } from '@/lib/course-progression';
import { ACHIEVEMENTS } from '@/lib/achievements-core';

type Params = { username: string };

type UserRow = {
  id: number;
  username: string;
  display_name: string | null;
  created_at: string;
};

type ProgressRow = {
  lesson_id: number;
  status: string;
  completed_at: string | null;
};

type AchievementRow = {
  badge_id: string;
  earned_at: string;
};

type CertificateRow = {
  certificate_id: string;
  generated_at: string;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { username } = await params;

  const profileUrl = `/u/${username}`;

  return {
    title: `@${username} • Opus Mastery Profile`,
    description: `View @${username}'s Opus Mastery lessons, achievements, and certificate status.`,
    alternates: {
      canonical: profileUrl,
    },
    openGraph: {
      title: `@${username} • Opus Mastery Profile`,
      description: `View @${username}'s Opus Mastery lessons, achievements, and certificate status.`,
      url: profileUrl,
      images: [`/u/${username}/badge/image`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `@${username} • Opus Mastery Profile`,
      description: `View @${username}'s Opus Mastery lessons, achievements, and certificate status.`,
      images: [`/u/${username}/badge/image`],
    },
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<Params> }) {
  const { username } = await params;

  const user = get<UserRow>('SELECT id, username, display_name, created_at FROM users WHERE username = ?', username);

  if (!user) {
    notFound();
  }

  const progress = all<ProgressRow>(
    'SELECT lesson_id, status, completed_at FROM progress WHERE user_id = ? ORDER BY lesson_id ASC',
    user.id,
  );

  const achievements = all<AchievementRow>(
    'SELECT badge_id, earned_at FROM achievements WHERE user_id = ? ORDER BY earned_at ASC',
    user.id,
  );

  const certificate = get<CertificateRow>(
    'SELECT certificate_id, generated_at FROM certificates WHERE user_id = ? ORDER BY generated_at DESC LIMIT 1',
    user.id,
  );

  const completedLessons = progress.filter((lesson) => lesson.status === 'completed').length;
  const title = getLearnerTitle(completedLessons);
  const achievementSet = new Set(achievements.map((item) => item.badge_id));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Public profile</p>
        <h1 className="mt-2 text-3xl font-bold text-white">{user.display_name || `@${user.username}`}</h1>
        <p className="mt-2 text-sm text-muted">@{user.username} • {title}</p>
        <p className="mt-1 text-sm text-muted">{completedLessons}/12 lessons completed</p>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-white">Lessons timeline</h2>
          <ol className="mt-4 space-y-2 text-sm text-muted">
            {Array.from({ length: 12 }, (_, index) => {
              const lessonId = index + 1;
              const row = progress.find((item) => item.lesson_id === lessonId);
              const done = row?.status === 'completed';

              return (
                <li key={lessonId} className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-3 py-2">
                  <span>Lesson {lessonId}</span>
                  <span className={done ? 'text-emerald-300' : 'text-muted'}>{done ? 'Completed' : 'In progress'}</span>
                </li>
              );
            })}
          </ol>
        </article>

        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-white">Achievements</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {ACHIEVEMENTS.map((achievement) => {
              const earned = achievementSet.has(achievement.badgeId);

              return (
                <li
                  key={achievement.badgeId}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-3 py-2"
                >
                  <span>
                    {achievement.icon} {achievement.name}
                  </span>
                  <span className={earned ? 'text-emerald-300' : 'text-muted'}>{earned ? 'Earned' : 'Locked'}</span>
                </li>
              );
            })}
          </ul>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-white">Certificate</h2>
        {certificate ? (
          <div className="mt-3 text-sm text-muted">
            <p>Certificate ID: {certificate.certificate_id}</p>
            <p>Issued: {new Date(certificate.generated_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
            <Link href={`/u/${user.username}/badge`} className="mt-3 inline-flex text-indigo-300 hover:text-indigo-200">
              View shareable badge →
            </Link>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">No certificate yet — complete all 12 lessons to unlock.</p>
        )}
      </section>
    </main>
  );
}
