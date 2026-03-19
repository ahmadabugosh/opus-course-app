export type LessonVerificationType = 'url' | 'screenshot' | 'url_or_screenshot';

export type LessonChallenge = {
  title: string;
  description: string;
  verificationType: LessonVerificationType;
  hint: string;
};

export type LessonMeta = {
  id: number;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  challenge: LessonChallenge;
  contentPath: `content/lesson-${string}.md`;
};

export const LESSONS: LessonMeta[] = [
  {
    id: 1,
    title: 'Your First Workflow',
    description: 'Build your first Opus workflow and run it in preview mode.',
    duration: '20 minutes',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    challenge: {
      title: 'Text Summarizer Workflow',
      description: 'Build a text summarizer workflow and show successful preview output.',
      verificationType: 'url_or_screenshot',
      hint: 'Use one workflow input, one Opus Agent task, and one workflow output.',
    },
    contentPath: 'content/lesson-01.md',
  },
  {
    id: 2,
    title: 'Mastering the Builder',
    description: 'Learn the visual builder, variable wiring, and multi-step chains.',
    duration: '25 minutes',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    challenge: {
      title: '3-Step Document Processor',
      description: 'Create a 3-task chain that extracts facts, summarizes, and outputs action items.',
      verificationType: 'screenshot',
      hint: 'Show all three connected tasks on the canvas in one screenshot.',
    },
    contentPath: 'content/lesson-02.md',
  },
  {
    id: 3,
    title: 'The Opus Agent',
    description: 'Master prompt design, blueprint generation, and reliable outputs.',
    duration: '25 minutes',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    challenge: {
      title: 'Customer Feedback Analyzer',
      description: 'Create sentiment, extraction, and response generation in one workflow.',
      verificationType: 'screenshot',
      hint: 'Make sure the output shows sentiment plus a drafted response.',
    },
    contentPath: 'content/lesson-03.md',
  },
  {
    id: 4,
    title: 'Decision Agents',
    description: 'Add conditional routing with decision branches.',
    duration: '25 minutes',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    challenge: {
      title: 'Support Ticket Router',
      description: 'Route incoming tickets to high, medium, or low priority branches.',
      verificationType: 'screenshot',
      hint: 'Show the decision node and 3 branch paths.',
    },
    contentPath: 'content/lesson-04.md',
  },
  {
    id: 5,
    title: 'Custom Agents',
    description: 'Pick models directly and configure advanced generation behavior.',
    duration: '30 minutes',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    challenge: {
      title: 'Multi-language Content Generator',
      description: 'Generate and review multilingual marketing copy using multiple models.',
      verificationType: 'screenshot',
      hint: 'Show output from at least two models in your evidence.',
    },
    contentPath: 'content/lesson-05.md',
  },
  {
    id: 6,
    title: 'Human-in-the-Loop',
    description: 'Introduce review and approval gates in automation flows.',
    duration: '30 minutes',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    challenge: {
      title: 'Content Approval Pipeline',
      description: 'Build a workflow with AI drafting plus a required human review step.',
      verificationType: 'screenshot',
      hint: 'Include the review step configuration in your screenshot.',
    },
    contentPath: 'content/lesson-06.md',
  },
  {
    id: 7,
    title: 'Data Tasks',
    description: 'Process files and convert unstructured data into structured outputs.',
    duration: '30 minutes',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    challenge: {
      title: 'Invoice Processor',
      description: 'Extract and structure invoice data from a PDF.',
      verificationType: 'screenshot',
      hint: 'Capture the structured vendor, amount, and date fields in your proof.',
    },
    contentPath: 'content/lesson-07.md',
  },
  {
    id: 8,
    title: 'Integrations',
    description: 'Connect Opus workflows to external apps and APIs.',
    duration: '30 minutes',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    challenge: {
      title: 'Lead Enrichment Workflow',
      description: 'Enrich lead records with an external API and output a score.',
      verificationType: 'screenshot',
      hint: 'Show both integration configuration and resulting output data.',
    },
    contentPath: 'content/lesson-08.md',
  },
  {
    id: 9,
    title: 'Sub-Workflows',
    description: 'Build reusable automations with Execute Workflow tasks.',
    duration: '30 minutes',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    challenge: {
      title: 'Content Repurposer',
      description: 'Use one main workflow plus sub-workflows for multi-channel outputs.',
      verificationType: 'screenshot',
      hint: 'Show both the parent workflow and at least one child workflow.',
    },
    contentPath: 'content/lesson-09.md',
  },
  {
    id: 10,
    title: 'Opus Code',
    description: 'Use Python tasks for calculations and advanced transformations.',
    duration: '35 minutes',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    challenge: {
      title: 'Financial Report Generator',
      description: 'Use Opus Code to process sales data and produce report outputs.',
      verificationType: 'screenshot',
      hint: 'Include the code task and computed output in your screenshot.',
    },
    contentPath: 'content/lesson-10.md',
  },
  {
    id: 11,
    title: 'Going to Production',
    description: 'Activate workflows, run jobs, and monitor production behavior.',
    duration: '30 minutes',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    challenge: {
      title: 'Production Workflow Rollout',
      description: 'Activate one workflow and run at least 3 production jobs.',
      verificationType: 'screenshot',
      hint: 'Capture the jobs page showing at least 3 successful runs.',
    },
    contentPath: 'content/lesson-11.md',
  },
  {
    id: 12,
    title: 'Capstone Project',
    description: 'Build a full end-to-end automation using everything from the course.',
    duration: '45 minutes',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    challenge: {
      title: 'End-to-End Automation Build',
      description: 'Deliver a production-ready workflow with architecture explanation.',
      verificationType: 'url_or_screenshot',
      hint: 'Submit your workflow URL plus a short architecture description.',
    },
    contentPath: 'content/lesson-12.md',
  },
];

export const LESSON_COUNT = LESSONS.length;

export function getAllLessons(): LessonMeta[] {
  return LESSONS;
}

export function getLessonById(lessonId: number): LessonMeta | null {
  return LESSONS.find((lesson) => lesson.id === lessonId) ?? null;
}

export function getLessonIds(): number[] {
  return LESSONS.map((lesson) => lesson.id);
}
