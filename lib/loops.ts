import { LoopsClient } from 'loops';

const apiKey = process.env.LOOPS_API_KEY;

if (!apiKey) {
  console.warn('[Loops] LOOPS_API_KEY not configured - email automation disabled');
}

const loops = apiKey ? new LoopsClient(apiKey) : null;

/**
 * Add or update a contact in Loops
 */
export async function addOrUpdateContact(data: {
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  lessonsCompleted?: number;
  achievementsEarned?: number;
  completionDate?: string;
  certificateId?: string;
}): Promise<boolean> {
  if (!loops) {
    console.warn('[Loops] Contact sync skipped - API key not configured');
    return false;
  }

  try {
    const response = await loops.createContact(data.email, {
      firstName: data.firstName,
      lastName: data.lastName,
      userGroup: 'opus-mastery-student',
      ...(data.displayName && { displayName: data.displayName }),
      ...(data.lessonsCompleted !== undefined && { lessonsCompleted: data.lessonsCompleted }),
      ...(data.achievementsEarned !== undefined && { achievementsEarned: data.achievementsEarned }),
      ...(data.completionDate && { completionDate: data.completionDate }),
      ...(data.certificateId && { certificateId: data.certificateId }),
    });

    console.info(`[Loops] Contact added/updated: ${data.email}`, response);
    return true;
  } catch (error) {
    console.error('[Loops] Failed to add/update contact:', error);
    return false;
  }
}

/**
 * Send a custom event to Loops
 */
export async function sendEvent(
  email: string,
  eventName: string,
  eventProperties?: Record<string, unknown>,
): Promise<boolean> {
  if (!loops) {
    console.warn('[Loops] Event send skipped - API key not configured');
    return false;
  }

  try {
    const response = await loops.sendEvent(email, eventName, eventProperties);
    console.info(`[Loops] Event sent: ${eventName} for ${email}`, response);
    return true;
  } catch (error) {
    console.error(`[Loops] Failed to send event ${eventName}:`, error);
    return false;
  }
}

/**
 * Send course completion event
 */
export async function sendCourseCompletionEvent(data: {
  email: string;
  certificateId: string;
  completionDate: string;
  lessonsCompleted: number;
  achievementsEarned: number;
}): Promise<boolean> {
  return sendEvent(data.email, 'course_completed', {
    certificateId: data.certificateId,
    completionDate: data.completionDate,
    lessonsCompleted: data.lessonsCompleted,
    achievementsEarned: data.achievementsEarned,
  });
}

/**
 * Track lesson progress milestone
 */
export async function trackProgressMilestone(
  email: string,
  lessonsCompleted: number,
  totalLessons: number = 12,
): Promise<boolean> {
  const percentage = Math.floor((lessonsCompleted / totalLessons) * 100);
  const milestones = [25, 50, 75, 100];
  const milestone = milestones.find((m) => percentage >= m && percentage < m + 10);

  if (!milestone) {
    return false;
  }

  return sendEvent(email, 'progress_milestone', {
    lessonsCompleted,
    totalLessons,
    percentage,
    milestone: `${milestone}%`,
  });
}
