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
  userId?: string;
  questsCompletedCount?: number;
  courseCompleted?: boolean;
  courseCompletedAt?: string;
  lastLoginAt?: string;
  source?: string;
  userGroup?: string;
  attestationUid?: string;
}): Promise<boolean> {
  if (!loops) {
    console.warn('[Loops] Contact sync skipped - API key not configured');
    return false;
  }

  try {
    const properties: Record<string, string | number | boolean | null> = {
      userGroup: data.userGroup || 'opus-mastery',
      source: data.source || 'learn-opus',
      lastLoginAt: data.lastLoginAt || new Date().toISOString(),
    };

    if (data.firstName) properties.firstName = data.firstName;
    if (data.lastName) properties.lastName = data.lastName;
    if (data.userId) properties.userId = data.userId;
    if (data.questsCompletedCount !== undefined) properties.questsCompletedCount = data.questsCompletedCount;
    if (data.courseCompleted !== undefined) properties.courseCompleted = data.courseCompleted;
    if (data.courseCompletedAt) properties.courseCompletedAt = data.courseCompletedAt;
    if (data.attestationUid) properties.attestationUid = data.attestationUid;

    const response = await loops.createContact({
      email: data.email,
      properties,
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
  eventProperties?: Record<string, string | number | boolean>,
): Promise<boolean> {
  if (!loops) {
    console.warn('[Loops] Event send skipped - API key not configured');
    return false;
  }

  try {
    const response = await loops.sendEvent({
      email,
      eventName,
      eventProperties,
    });
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
  attestationUid?: string;
  courseCompletedAt: string;
  questsCompletedCount: number;
}): Promise<boolean> {
  const eventProps: Record<string, string | number | boolean> = {
    courseCompletedAt: data.courseCompletedAt,
    questsCompletedCount: data.questsCompletedCount,
  };

  if (data.attestationUid) {
    eventProps.attestationUid = data.attestationUid;
  }

  return sendEvent(data.email, 'course_completed', eventProps);
}

/**
 * Track lesson progress milestone
 */
export async function trackProgressMilestone(
  email: string,
  questsCompletedCount: number,
  totalQuests: number = 12,
): Promise<boolean> {
  const percentage = Math.floor((questsCompletedCount / totalQuests) * 100);
  const milestones = [25, 50, 75, 100];
  const milestone = milestones.find((m) => percentage >= m && percentage < m + 10);

  if (!milestone) {
    return false;
  }

  return sendEvent(email, 'progress_milestone', {
    questsCompletedCount,
    totalQuests,
    percentage,
    milestone: `${milestone}%`,
  });
}

/**
 * Send OTP code via Loops transactional email
 */
export async function sendOtpEmail(email: string, otpCode: string): Promise<boolean> {
  if (!loops) {
    console.warn('[Loops] OTP email skipped - API key not configured');
    return false;
  }

  try {
    const response = await loops.sendTransactionalEmail({
      transactionalId: 'cmn0xrrp22xbz0i0u9i4ovg3q',
      email,
      dataVariables: {
        otpCode,
      },
    });

    console.info(`[Loops] OTP email sent to ${email}`, response);
    return true;
  } catch (error) {
    console.error(`[Loops] Failed to send OTP email to ${email}:`, error);
    return false;
  }
}
