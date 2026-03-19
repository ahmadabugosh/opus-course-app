import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { ACHIEVEMENTS, syncAchievementsForUser } from '@/lib/achievements';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

type AchievementPayload = {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
};

async function getSessionUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = verifySessionToken(token);
  return payload?.userId ?? null;
}

export async function GET() {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const earnedBadges = syncAchievementsForUser(userId);
  const earnedSet = new Set(earnedBadges);

  const achievements: AchievementPayload[] = ACHIEVEMENTS.map((achievement) => ({
    badgeId: achievement.badgeId,
    name: achievement.name,
    description: achievement.description,
    icon: achievement.icon,
    earned: earnedSet.has(achievement.badgeId),
  }));

  return NextResponse.json({ achievements, earnedBadges });
}
