import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { get } from '@/lib/db';

type Params = { username: string };

type UserBadgeRow = {
  username: string;
  display_name: string | null;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { username } = await params;

  return {
    title: `${username} • Opus Mastery Badge`,
    description: `Share ${username}'s Opus Mastery progress badge.`,
    openGraph: {
      title: `${username} • Opus Mastery Badge`,
      description: `Share ${username}'s Opus Mastery progress badge.`,
      images: [`/u/${username}/badge/image`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${username} • Opus Mastery Badge`,
      description: `Share ${username}'s Opus Mastery progress badge.`,
      images: [`/u/${username}/badge/image`],
    },
  };
}

export default async function BadgePage({ params }: { params: Promise<Params> }) {
  const { username } = await params;

  const user = get<UserBadgeRow>('SELECT username, display_name FROM users WHERE username = ?', username);

  if (!user) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Shareable badge</p>
        <h1 className="mt-2 text-3xl font-bold text-white">{user.display_name || `@${user.username}`}</h1>
        <p className="mt-2 text-sm text-muted">OpenGraph image preview for social sharing.</p>

        <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-black/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/u/${user.username}/badge/image`}
            alt={`${user.username} Opus Mastery badge image`}
            className="h-auto w-full"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <a
            href={`/u/${user.username}/badge/image`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-400"
          >
            Open badge image
          </a>
          <Link href={`/u/${user.username}`} className="rounded-lg border border-white/20 px-4 py-2 font-semibold text-white hover:border-white/40">
            Back to profile
          </Link>
        </div>
      </section>
    </main>
  );
}
