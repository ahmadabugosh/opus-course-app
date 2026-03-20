export type LessonVerificationType = 'text_output' | 'url' | 'json_output' | 'mixed';

export type LessonChallenge = {
  title: string;
  description: string;
  verificationType: LessonVerificationType;
  verificationPrompt: string;
  verificationMinLength: number;
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
    videoUrl: '/videos/lesson-01.mp4',
    challenge: {
      title: 'Text Summarizer Workflow',
      description: 'Build a text summarizer workflow and show successful preview output.',
      verificationType: 'text_output',
      verificationPrompt: 'Paste the workflow preview output (the summarized text result) from your run.',
      verificationMinLength: 60,
      hint: 'Use one workflow input, one Opus Agent task, and one workflow output.',
    },
    contentPath: 'content/lesson-01.md',
  },
  {
    id: 2,
    title: 'Mastering the Builder',
    description: 'Learn the visual builder, variable wiring, and multi-step chains.',
    duration: '25 minutes',
    videoUrl: '/videos/lesson-02.mp4',
    challenge: {
      title: '3-Step Document Processor',
      description: 'Create a 3-task chain that extracts facts, summarizes, and outputs action items.',
      verificationType: 'url',
      verificationPrompt: 'Paste the workflow ID or URL from the builder showing 3+ connected tasks.',
      verificationMinLength: 24,
      hint: 'Show all three connected tasks on the canvas in one workflow.',
    },
    contentPath: 'content/lesson-02.md',
  },
  {
    id: 3,
    title: 'The Opus Agent',
    description: 'Master prompt design, blueprint generation, and reliable outputs.',
    duration: '25 minutes',
    videoUrl: '/videos/lesson-03.mp4',
    challenge: {
      title: 'Customer Feedback Analyzer',
      description: 'Create sentiment, extraction, and response generation in one workflow.',
      verificationType: 'json_output',
      verificationPrompt: 'Paste the JSON output showing a sentiment analysis result for sample feedback.',
      verificationMinLength: 80,
      hint: 'Make sure the output includes sentiment plus supporting fields.',
    },
    contentPath: 'content/lesson-03.md',
  },
  {
    id: 4,
    title: 'Decision Agents',
    description: 'Add conditional routing with decision branches.',
    duration: '25 minutes',
    videoUrl: '/videos/lesson-04.mp4',
    challenge: {
      title: 'Support Ticket Router',
      description: 'Route incoming tickets to high, medium, or low priority branches.',
      verificationType: 'text_output',
      verificationPrompt: 'Paste the decision branch output showing a ticket routed to the correct priority.',
      verificationMinLength: 70,
      hint: 'Show the decision node and branch outcome in your output text.',
    },
    contentPath: 'content/lesson-04.md',
  },
  {
    id: 5,
    title: 'Custom Agents',
    description: 'Pick models directly and configure advanced generation behavior.',
    duration: '30 minutes',
    videoUrl: '/videos/lesson-05.mp4',
    challenge: {
      title: 'Multi-language Content Generator',
      description: 'Generate and review multilingual marketing copy using multiple models.',
      verificationType: 'text_output',
      verificationPrompt: 'Paste the model configuration output showing your custom agent setup.',
      verificationMinLength: 60,
      hint: 'Include model name, instructions, and key generation settings.',
    },
    contentPath: 'content/lesson-05.md',
  },
  {
    id: 6,
    title: 'Human-in-the-Loop',
    description: 'Introduce review and approval gates in automation flows.',
    duration: '30 minutes',
    videoUrl: '/videos/lesson-06.mp4',
    challenge: {
      title: 'Content Approval Pipeline',
      description: 'Build a workflow with AI drafting plus a required human review step.',
      verificationType: 'text_output',
      verificationPrompt: 'Paste the human review step output or approval log from the run.',
      verificationMinLength: 60,
      hint: 'Include reviewer status and the approved/rejected action.',
    },
    contentPath: 'content/lesson-06.md',
  },
  {
    id: 7,
    title: 'Data Tasks',
    description: 'Process files and convert unstructured data into structured outputs.',
    duration: '30 minutes',
    videoUrl: '/videos/lesson-07.mp4',
    challenge: {
      title: 'Invoice Processor',
      description: 'Extract and structure invoice data from a PDF.',
      verificationType: 'json_output',
      verificationPrompt: 'Paste the structured JSON extracted from the invoice PDF.',
      verificationMinLength: 90,
      hint: 'Capture vendor, amount, date, and invoice number fields.',
    },
    contentPath: 'content/lesson-07.md',
  },
  {
    id: 8,
    title: 'Integrations',
    description: 'Connect Opus workflows to external apps and APIs.',
    duration: '30 minutes',
    videoUrl: '/videos/lesson-08.mp4',
    challenge: {
      title: 'Lead Enrichment Workflow',
      description: 'Enrich lead records with an external API and output a score.',
      verificationType: 'json_output',
      verificationPrompt: 'Paste the integration response showing enriched lead data.',
      verificationMinLength: 80,
      hint: 'Include both original fields and enriched attributes in the response.',
    },
    contentPath: 'content/lesson-08.md',
  },
  {
    id: 9,
    title: 'Sub-Workflows',
    description: 'Build reusable automations with Execute Workflow tasks.',
    duration: '30 minutes',
    videoUrl: '/videos/lesson-09.mp4',
    challenge: {
      title: 'Content Repurposer',
      description: 'Use one main workflow plus sub-workflows for multi-channel outputs.',
      verificationType: 'text_output',
      verificationPrompt: 'Paste the sub-workflow execution log showing parent → child flow.',
      verificationMinLength: 75,
      hint: 'Include parent workflow ID and child workflow execution references.',
    },
    contentPath: 'content/lesson-09.md',
  },
  {
    id: 10,
    title: 'Opus Code',
    description: 'Use Python tasks for calculations and advanced transformations.',
    duration: '35 minutes',
    videoUrl: '/videos/lesson-10.mp4',
    challenge: {
      title: 'Financial Report Generator',
      description: 'Use Opus Code to process sales data and produce report outputs.',
      verificationType: 'text_output',
      verificationPrompt: 'Paste the Python code task output from Opus Code.',
      verificationMinLength: 70,
      hint: 'Include a snippet of output proving the code execution completed.',
    },
    contentPath: 'content/lesson-10.md',
  },
  {
    id: 11,
    title: 'Going to Production',
    description: 'Activate workflows, run jobs, and monitor production behavior.',
    duration: '30 minutes',
    videoUrl: '/videos/lesson-11.mp4',
    challenge: {
      title: 'Production Workflow Rollout',
      description: 'Activate one workflow and run at least 3 production jobs.',
      verificationType: 'text_output',
      verificationPrompt: 'Paste the Jobs page output showing 3+ completed job IDs.',
      verificationMinLength: 50,
      hint: 'Make sure at least three successful job identifiers are visible.',
    },
    contentPath: 'content/lesson-11.md',
  },
  {
    id: 12,
    title: 'Capstone Project',
    description: 'Build a full end-to-end automation using everything from the course.',
    duration: '45 minutes',
    videoUrl: '/videos/lesson-12.mp4',
    challenge: {
      title: 'End-to-End Automation Build',
      description: 'Deliver a production-ready workflow with architecture explanation.',
      verificationType: 'mixed',
      verificationPrompt:
        'Paste the full workflow URL and add a 2–3 sentence architecture description of the automation.',
      verificationMinLength: 120,
      hint: 'Share both the final workflow URL and your architecture summary.',
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
