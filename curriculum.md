# Opus AI Workflow Automation — 12-Lesson Course Curriculum

**Course Title:** Master Opus: Build Enterprise AI Workflows from Zero to Production
**Format:** 12 lessons, each with theory + hands-on project
**Audience:** Business operators, automation enthusiasts, no-code builders, operations managers
**Prerequisites:** None (complete beginner-friendly)

---

## Course Overview

This course takes you from zero to building production-ready AI workflows on Opus. Each lesson builds on the previous one, introducing new task types and concepts while building real-world automations. By Lesson 12, you'll have a portfolio of working workflows and the skills to automate virtually any business process.

---

## Lesson 1: Welcome to Opus — Your First Workflow in 5 Minutes

**Objective:** Understand what Opus is, create your account, navigate the platform, and build your very first workflow.

**Topics:**
- What is Opus? (AI-native workflow automation vs traditional automation)
- The Opus Work Knowledge Graph™ — what makes it different
- Creating your account and navigating the dashboard
- Organization → Workspace → Workflows hierarchy
- Understanding Manhours (how Opus billing works)

**Hands-On Project:** Build a "Hello World" workflow
- Create a new workflow from scratch
- Add a Workflow Input (text variable)
- Connect an Opus Agent task to summarize the input text in 3 bullet points
- Wire the output to Workflow Output
- Preview the workflow with sample data
- Celebrate — you just built your first AI workflow! 🎉

**Key Concepts:** Workflows, Tasks, Edges, Variables, Draft vs Active, Preview mode

---

## Lesson 2: The Builder — Mastering the Visual Editor

**Objective:** Become fluent in the Builder interface — adding tasks, wiring connections, configuring variables, and debugging.

**Topics:**
- Builder interface deep dive (toolbar, canvas, task palette, configuration panel)
- Task types overview: Agent, Data, Review, Execute Workflow
- Input/output variables — types, naming conventions, linking
- Edge connections — data flow and execution order
- Auto-link feature — let Opus intelligently map variables
- Preview mode — testing before activation
- Common errors and how to fix them

**Hands-On Project:** Multi-step document processor
- Input: a block of text (article, report, email)
- Task 1: Opus Agent → Extract key facts
- Task 2: Opus Agent → Generate a professional summary
- Task 3: Opus Agent → Create 3 action items from the content
- Wire all three outputs to Workflow Output
- Test with a real article

**Key Concepts:** Variable mapping, sequential task chains, blueprint generation, Generate Variable feature

---

## Lesson 3: The Opus Agent — Your AI Workhorse

**Objective:** Master the Opus Agent task — prompt engineering, blueprint generation, input/output configuration, and getting reliable results.

**Topics:**
- What is the Opus Agent? (LLM-powered reasoning, extraction, generation)
- Writing effective task descriptions (prompt engineering for Opus)
- Blueprint generation — what happens when you click "Generate Blueprint"
- Input variables — linking from upstream tasks
- Output variables — defining what the agent produces
- Auto-generated vs manually specified outputs
- Tips for reliable agent behavior (one action per task, clear instructions)

**Hands-On Project:** Customer feedback analyzer
- Input: Raw customer review text
- Agent 1: Classify sentiment (Positive / Negative / Neutral)
- Agent 2: Extract product/service mentioned
- Agent 3: Generate a suggested response
- Output: Structured analysis with sentiment, product, and drafted response

**Key Concepts:** Opus Agent, blueprint generation, prompt engineering, typed outputs

---

## Lesson 4: Decision Agents — Building Smart Routing

**Objective:** Add conditional logic to your workflows using Decision Agents and Human Decision Agents.

**Topics:**
- Decision Agent — automated routing based on conditions
- Human Decision Agent — pausing for human judgment
- Branching workflows — multiple paths based on outcomes
- Natural language conditions vs logical expressions
- When to use automated vs human decisions

**Hands-On Project:** Support ticket router
- Input: Customer support ticket (subject + body)
- Decision Agent: Classify ticket priority (High / Medium / Low)
- Branch 1 (High): Flag for immediate human review
- Branch 2 (Medium): Generate AI draft response
- Branch 3 (Low): Auto-generate FAQ response
- Output: Routed response with priority classification

**Key Concepts:** Decision Agent, Human Decision Agent, branching, conditional routing

---

## Lesson 5: Custom Agents — Choosing Your Own LLM

**Objective:** Use the Custom Agent task for direct LLM control — pick your model, write your prompt, configure outputs.

**Topics:**
- Custom Agent vs Opus Agent — when to use which
- Supported LLM providers (OpenAI, Anthropic, DeepSeek, etc.)
- Model selection — balancing quality, speed, and cost
- Direct prompt control — system prompts, user prompts, output schemas
- Temperature, max tokens, and other parameters
- One-shot vs multi-step reasoning

**Hands-On Project:** Multi-language content generator
- Input: Marketing copy in English + target languages list
- Custom Agent (GPT-4o): Translate copy to each target language
- Custom Agent (Claude): Review translations for cultural sensitivity
- Output: Translated + reviewed marketing copy in multiple languages

**Key Concepts:** Custom Agent, LLM selection, prompt configuration, model comparison

---

## Lesson 6: Human-in-the-Loop — Review Tasks & Human Tasks

**Objective:** Add human oversight to your workflows — quality gates, approval steps, and manual input collection.

**Topics:**
- Why human-in-the-loop matters (accuracy, compliance, trust)
- Opus Human Task — collecting information from people
- Review Task (Human Review) — accept/reject with optional editing
- Review Task (Agentic Review) — AI validation with auto-correction
- Designing effective review interfaces
- Balancing automation with human oversight

**Hands-On Project:** Content approval pipeline
- Input: Blog post draft (title + body)
- Agent: Check for grammar, tone, and brand guidelines
- Agent: Generate SEO metadata (title, description, keywords)
- Human Review: Editor approves/rejects/edits the post
- Decision Agent: If approved → format for publishing; If rejected → send back with notes
- Output: Approved, publication-ready content with SEO metadata

**Key Concepts:** Human Review, Agentic Review, Human Task, approval workflows

---

## Lesson 7: Data Tasks — Import, Extract, and Export

**Objective:** Work with real-world data — importing files, extracting text from documents/images, and exporting results.

**Topics:**
- Import Data task — pulling from Google Drive, S3, and other sources
- Export Data task — sending results to external systems
- Opus Text Extraction — OCR for documents, images, PDFs
- File handling in workflows — upload URLs, file variables
- Structuring unstructured data (PDFs → structured JSON)

**Hands-On Project:** Invoice processor
- Import: Upload a PDF invoice
- Text Extraction: Extract all text from the invoice
- Opus Agent: Parse extracted text into structured fields (vendor, amount, date, line items, tax)
- Export: Send structured data to Google Sheets
- Output: Clean, structured invoice data ready for accounting

**Key Concepts:** Import Data, Export Data, Text Extraction, file handling, data structuring

---

## Lesson 8: Integrations Marketplace — Connecting 3,500+ Services

**Objective:** Connect your workflows to the tools you already use — CRMs, email, storage, databases, and more.

**Topics:**
- The Integrations Marketplace — 3,500+ connectors, 36,000+ actions
- Setting up integration credentials
- Integration Task — using pre-built connectors
- External Service task — connecting to any REST API
- Popular integrations: Google Workspace, Slack, Salesforce, HubSpot, Airtable
- Error handling with external services

**Hands-On Project:** Lead enrichment pipeline
- Trigger: New lead data (name, email, company)
- Integration (Google Sheets): Pull lead from sheet
- External Service: Call a company data API to enrich with company info
- Opus Agent: Score the lead based on enriched data (1-10)
- Opus Agent: Draft a personalized outreach email
- Integration (Gmail/Slack): Send the email or notify sales team
- Export: Update the Google Sheet with enrichment data and score

**Key Concepts:** Integrations Marketplace, External Service, API connections, credentials

---

## Lesson 9: Sub-Workflows — Modular, Reusable Automation

**Objective:** Build modular workflows using the Execute Workflow task — break complex processes into reusable building blocks.

**Topics:**
- Execute Workflow task — running workflows inside workflows
- Why modularity matters (reuse, maintenance, team collaboration)
- Designing input/output contracts between workflows
- Sub-workflow requirements (must be active, same workspace)
- Organizational patterns — shared utility workflows vs project-specific

**Hands-On Project:** Multi-channel content repurposer
- Main Workflow Input: Long-form blog post
- Sub-Workflow 1 "Social Formatter": Convert to Twitter thread (5-7 tweets)
- Sub-Workflow 2 "Email Formatter": Convert to newsletter format
- Sub-Workflow 3 "Summary Generator": Create LinkedIn post summary
- Main Workflow Output: All three formatted outputs ready to publish

**Key Concepts:** Execute Workflow, sub-workflows, modular design, input/output contracts

---

## Lesson 10: Opus Code — Custom Python When You Need It

**Objective:** Write custom Python code for logic that other tasks can't handle — data transformation, calculations, API calls, custom parsing.

**Topics:**
- When to use Opus Code vs other task types
- Python environment in Opus — available libraries, limitations
- Input/output variable handling in code
- Common use cases: data transformation, calculations, regex parsing, CSV/JSON manipulation
- Error handling and debugging in Opus Code
- Security and sandboxing

**Hands-On Project:** Financial report generator
- Input: CSV file with monthly sales data
- Opus Code: Parse CSV, calculate totals, growth rates, top performers
- Opus Agent: Generate executive summary narrative from the calculated data
- Opus Code: Format data into a structured report layout
- Human Review: CFO approves the report
- Export: Send to Google Drive as formatted document

**Key Concepts:** Opus Code, Python in workflows, data transformation, hybrid AI+code workflows

---

## Lesson 11: Going to Production — Jobs, Monitoring & Best Practices

**Objective:** Move from preview to production — activating workflows, running jobs, monitoring results, and following best practices.

**Topics:**
- Workflow lifecycle: Draft → Active (and versioning)
- Jobs — executing workflows in production
- Job Operator API — triggering workflows programmatically
- Monitoring — job status, audit logs, error tracking
- Manhours management — understanding usage and costs
- Best practices recap:
  - Validate inputs early
  - One action per task
  - Separate review from action
  - Test integrations in preview
  - Limit parallel heavy tasks

**Hands-On Project:** Productionize your best workflow
- Take the content approval pipeline (Lesson 6) or lead enrichment (Lesson 8)
- Add input validation at the start
- Add error handling branches
- Activate the workflow
- Run 3 real jobs through it
- Review audit logs and monitor results
- Set up an API trigger using the Job Operator API

**Key Concepts:** Activation, Jobs, Job Operator API, audit logs, versioning, Manhours

---

## Lesson 12: Capstone Project — Build Your Own End-to-End Automation

**Objective:** Apply everything you've learned to design and build a complete, production-ready workflow for a real business use case.

**Capstone Options (choose one):**

### Option A: Automated Hiring Pipeline
- Import: Receive resume (PDF) via file upload
- Text Extraction: Parse resume content
- Opus Agent: Extract candidate details (name, skills, experience, education)
- Custom Agent: Score candidate fit against job requirements (1-10)
- Decision Agent: Route based on score (≥7 → interview, 4-6 → maybe, <4 → reject)
- Human Review: Hiring manager reviews shortlisted candidates
- Integration: Send interview invitation via email
- Export: Update tracking sheet with all candidates

### Option B: Customer Onboarding Automation
- Input: New customer signup form data
- Opus Agent: Analyze customer needs and recommend product configuration
- Integration: Create customer account in CRM
- Sub-Workflow: Generate personalized welcome email sequence (3 emails)
- Human Task: Account manager reviews and customizes the onboarding plan
- Integration: Schedule kickoff call via calendar
- Export: Create onboarding dashboard entry

### Option C: Design Your Own
- Identify a real workflow from your business
- Design it using the skills from all 12 lessons
- Must include: ≥5 tasks, ≥1 decision branch, ≥1 human review, ≥1 integration
- Present your workflow architecture and run a live demo

**Deliverables:**
- Working, activated workflow in Opus
- Architecture diagram showing task flow
- 3 successful job runs with results
- Brief write-up: what it does, why it matters, lessons learned

---

## Course Summary — Skills Acquired

| Lesson | Skill Unlocked |
|---|---|
| 1 | Create workflows, use Opus Agent, preview |
| 2 | Master the Builder, wire complex task chains |
| 3 | Prompt engineering for reliable AI agents |
| 4 | Conditional routing and branching logic |
| 5 | Multi-model LLM selection and configuration |
| 6 | Human oversight, reviews, and approval gates |
| 7 | Document processing and data extraction |
| 8 | External integrations and API connections |
| 9 | Modular sub-workflow architecture |
| 10 | Custom Python code for advanced logic |
| 11 | Production deployment, monitoring, and APIs |
| 12 | End-to-end workflow design and execution |

---

*Course structure inspired by the Hatch OpenClaw course (hatch.learnopenclaw.ai) — progressive, hands-on, project-based learning.*
