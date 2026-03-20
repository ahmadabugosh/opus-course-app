#!/usr/bin/env python3
"""
Generate screenshot-style tutorial videos for all 12 Opus Mastery lessons.
Pipeline: Script → Slides (PIL) → Voiceover (OpenAI TTS) → Render (ffmpeg)
"""

import os
import sys
import json
import subprocess
import textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# ── Config ──────────────────────────────────────────────────────────────────
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    print("❌ OPENAI_API_KEY not set"); sys.exit(1)

OUTPUT_DIR = Path('/root/projects/opus-course-app/public/videos')
TEMP_DIR = Path('/tmp/opus-videos')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)

# Slide dimensions (16:9)
W, H = 1920, 1080

# Colors (Opus brand)
BG = (10, 10, 26)          # #0A0A1A
SURFACE = (26, 26, 54)     # #1A1A36
ACCENT = (99, 102, 241)    # #6366F1
GREEN = (16, 185, 129)     # #10B981
TEXT_WHITE = (255, 255, 255)
TEXT_GRAY = (156, 163, 207) # #9CA3CF
TEXT_LIGHT = (212, 212, 239) # #D4D4EF
BORDER = (42, 42, 74)      # #2A2A4A
ORANGE = (245, 158, 11)    # #F59E0B

# Font setup
def get_font(size, bold=False):
    paths = [
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

FONT_TITLE = get_font(52, bold=True)
FONT_SUBTITLE = get_font(28)
FONT_HEADING = get_font(36, bold=True)
FONT_BODY = get_font(26)
FONT_CODE = get_font(22)
FONT_SMALL = get_font(20)
FONT_STEP_NUM = get_font(44, bold=True)
FONT_BADGE = get_font(18, bold=True)

# ── Lesson Data ─────────────────────────────────────────────────────────────
LESSONS = [
    {
        "id": 1,
        "title": "Your First Workflow",
        "desc": "Create your first Opus workflow and run it in preview mode.",
        "steps": [
            "Open Opus and create a new workflow",
            "Add a text input variable called 'raw_text'",
            "Add an Opus Agent task to summarize text",
            "Connect the agent output to workflow output",
            "Run preview with sample text"
        ],
        "narration": "Welcome to Lesson 1: Your First Workflow. In this lesson, you'll learn how to create your first Opus workflow from scratch. We'll start by opening Opus and creating a new workflow. Then we'll add a text input variable, connect it to an Opus Agent that summarizes text, and wire the output. Finally, we'll run a preview to see our workflow in action. By the end, you'll have a working text summarizer. Let's get started!"
    },
    {
        "id": 2,
        "title": "Mastering the Builder",
        "desc": "Learn the visual builder, variable wiring, and multi-step chains.",
        "steps": [
            "Open the visual builder canvas",
            "Create a 3-task processing chain",
            "Wire variables between tasks",
            "Configure each agent's prompt",
            "Test the chain end-to-end"
        ],
        "narration": "Lesson 2: Mastering the Builder. Now that you've built a simple workflow, let's go deeper into the visual builder. You'll learn to create multi-step chains by connecting three tasks together. We'll wire variables between tasks so data flows from one agent to the next. You'll configure each agent's prompt for a specific job: extracting facts, summarizing them, and generating action items. Then we'll test the entire chain end-to-end."
    },
    {
        "id": 3,
        "title": "The Opus Agent",
        "desc": "Master prompt design, blueprint generation, and reliable outputs.",
        "steps": [
            "Configure an Opus Agent task",
            "Design a structured prompt template",
            "Set output format to JSON",
            "Add input variables for dynamic data",
            "Test with real customer feedback"
        ],
        "narration": "Lesson 3: The Opus Agent. The Opus Agent is the brain of your workflows. In this lesson, you'll master prompt design by creating a structured template that produces consistent, reliable outputs. We'll configure the agent to output JSON, add dynamic input variables, and test it with real customer feedback data. You'll build a sentiment analyzer that classifies feedback and drafts appropriate responses."
    },
    {
        "id": 4,
        "title": "Decision Agents",
        "desc": "Add conditional routing with decision branches.",
        "steps": [
            "Add a Decision task to your workflow",
            "Define routing conditions",
            "Create three priority branches",
            "Connect each branch to different handlers",
            "Test with various ticket types"
        ],
        "narration": "Lesson 4: Decision Agents. Not every input should follow the same path. In this lesson, you'll learn to add conditional routing using Decision tasks. We'll build a support ticket router that classifies incoming tickets as high, medium, or low priority, then routes each to a different handler. You'll define the routing conditions and test with various ticket types to ensure correct classification."
    },
    {
        "id": 5,
        "title": "Custom Agents",
        "desc": "Pick models directly and configure advanced generation behavior.",
        "steps": [
            "Select a specific AI model for your task",
            "Configure temperature and token limits",
            "Set up a multi-language generator",
            "Compare outputs across models",
            "Optimize for cost vs quality"
        ],
        "narration": "Lesson 5: Custom Agents. Sometimes you need more control over which AI model runs your task. In this lesson, you'll learn to pick specific models, configure temperature and token limits, and set up a multi-language content generator. We'll compare outputs across different models and discuss how to optimize for cost versus quality in production workflows."
    },
    {
        "id": 6,
        "title": "Human-in-the-Loop",
        "desc": "Add human review gates for quality and compliance.",
        "steps": [
            "Add a Human Review task",
            "Configure approval and rejection paths",
            "Set up reviewer notifications",
            "Handle rejected items with feedback",
            "Test the complete approval flow"
        ],
        "narration": "Lesson 6: Human-in-the-Loop. Automation is powerful, but some decisions need human judgment. In this lesson, you'll add human review gates to your workflows. We'll configure approval and rejection paths, set up reviewer notifications, and handle rejected items with feedback loops. You'll build a content approval pipeline where AI generates drafts and humans approve before publishing."
    },
    {
        "id": 7,
        "title": "Data Tasks",
        "desc": "Process documents and extract structured data.",
        "steps": [
            "Upload a PDF document as input",
            "Configure data extraction fields",
            "Map extracted data to structured JSON",
            "Add validation rules",
            "Export processed results"
        ],
        "narration": "Lesson 7: Data Tasks. Many real-world workflows involve processing documents. In this lesson, you'll learn to extract structured data from PDFs using Opus data tasks. We'll configure extraction fields for an invoice processor, map the extracted data to a clean JSON format, add validation rules, and export the processed results. This pattern works for invoices, contracts, forms, and more."
    },
    {
        "id": 8,
        "title": "Integrations",
        "desc": "Connect workflows to external services and APIs.",
        "steps": [
            "Add an integration task to your workflow",
            "Configure API credentials securely",
            "Map workflow data to API parameters",
            "Handle API responses and errors",
            "Build a lead enrichment pipeline"
        ],
        "narration": "Lesson 8: Integrations. Opus workflows become truly powerful when connected to external services. In this lesson, you'll learn to add integration tasks, configure API credentials securely, and map workflow data to API parameters. We'll handle responses and errors gracefully, and build a lead enrichment pipeline that pulls additional data from external services."
    },
    {
        "id": 9,
        "title": "Sub-Workflows",
        "desc": "Compose complex automations from reusable workflow modules.",
        "steps": [
            "Create a reusable sub-workflow",
            "Add an Execute Workflow task",
            "Pass data between parent and child",
            "Handle sub-workflow errors",
            "Build a content repurposing system"
        ],
        "narration": "Lesson 9: Sub-Workflows. As your automations grow, you'll want to break them into reusable modules. In this lesson, you'll create sub-workflows and call them from parent workflows using the Execute Workflow task. We'll pass data between parent and child, handle errors, and build a content repurposing system that takes one article and generates social posts, email summaries, and more."
    },
    {
        "id": 10,
        "title": "Opus Code",
        "desc": "Run custom Python code inside your workflows.",
        "steps": [
            "Add an Opus Code task",
            "Write Python code for data processing",
            "Access workflow variables in code",
            "Return structured results",
            "Build a financial report generator"
        ],
        "narration": "Lesson 10: Opus Code. Sometimes you need custom logic that goes beyond what agents can do. Opus Code lets you run Python directly inside your workflows. In this lesson, you'll write code for data processing, access workflow variables, return structured results, and build a financial report generator that calculates metrics and formats a professional report."
    },
    {
        "id": 11,
        "title": "Going to Production",
        "desc": "Activate workflows and run real jobs.",
        "steps": [
            "Switch workflow from draft to active",
            "Configure job triggers and schedules",
            "Monitor job execution and logs",
            "Handle failures and retries",
            "Run 3 successful production jobs"
        ],
        "narration": "Lesson 11: Going to Production. You've built powerful workflows — now it's time to run them for real. In this lesson, you'll activate your workflow, configure job triggers and schedules, monitor execution through logs, and handle failures with retries. By the end, you'll have run at least three successful production jobs and understand how to operate workflows reliably."
    },
    {
        "id": 12,
        "title": "Capstone Project",
        "desc": "Build a complete end-to-end automation using all core Opus patterns.",
        "steps": [
            "Design your workflow architecture",
            "Implement agents, decisions, and integrations",
            "Add human review and error handling",
            "Deploy and run production jobs",
            "Document and present your automation"
        ],
        "narration": "Lesson 12: The Capstone Project. This is where everything comes together. You'll design and build a complete end-to-end automation using agents, decisions, integrations, human review, and code tasks. Choose a real business use case, implement it from scratch, deploy it to production, and document your architecture. Congratulations — after this lesson, you're an Opus Master!"
    }
]

# ── Slide Rendering ─────────────────────────────────────────────────────────

def draw_rounded_rect(draw, xy, radius, fill=None, outline=None, width=1):
    """Draw a rounded rectangle"""
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)

def create_title_slide(lesson):
    """Slide 1: Title card"""
    img = Image.new('RGB', (W, H), BG)
    draw = ImageDraw.Draw(img)
    
    # Accent bar at top
    draw.rectangle([0, 0, W, 6], fill=ACCENT)
    
    # Lesson badge
    badge_text = f"LESSON {lesson['id']} OF 12"
    draw_rounded_rect(draw, [W//2 - 140, 280, W//2 + 140, 320], radius=12, fill=ACCENT)
    bbox = draw.textbbox((0, 0), badge_text, font=FONT_BADGE)
    tw = bbox[2] - bbox[0]
    draw.text((W//2 - tw//2, 288), badge_text, fill=TEXT_WHITE, font=FONT_BADGE)
    
    # Title
    bbox = draw.textbbox((0, 0), lesson['title'], font=FONT_TITLE)
    tw = bbox[2] - bbox[0]
    draw.text((W//2 - tw//2, 380), lesson['title'], fill=TEXT_WHITE, font=FONT_TITLE)
    
    # Description
    desc = lesson['desc']
    bbox = draw.textbbox((0, 0), desc, font=FONT_SUBTITLE)
    tw = bbox[2] - bbox[0]
    draw.text((W//2 - tw//2, 470), desc, fill=TEXT_GRAY, font=FONT_SUBTITLE)
    
    # Opus Mastery branding
    brand = "⚡ OPUS MASTERY"
    draw.text((W//2 - 100, 620), brand, fill=ACCENT, font=FONT_BODY)
    
    # Bottom bar
    draw.rectangle([0, H-4, W, H], fill=ACCENT)
    
    return img

def create_step_slide(lesson, step_idx, step_text):
    """Individual step slides"""
    img = Image.new('RGB', (W, H), BG)
    draw = ImageDraw.Draw(img)
    
    # Header bar
    draw.rectangle([0, 0, W, 80], fill=SURFACE)
    draw.rectangle([0, 78, W, 80], fill=BORDER)
    header = f"Lesson {lesson['id']}: {lesson['title']}"
    draw.text((60, 22), header, fill=TEXT_LIGHT, font=FONT_BODY)
    
    # Progress dots
    dot_start_x = W - 320
    for i in range(12):
        color = GREEN if i < lesson['id'] else BORDER
        if i == lesson['id'] - 1:
            color = ACCENT
        draw.ellipse([dot_start_x + i*24, 35, dot_start_x + i*24 + 12, 47], fill=color)
    
    # Step number (big)
    step_num = str(step_idx + 1)
    draw_rounded_rect(draw, [120, 250, 220, 350], radius=16, fill=ACCENT)
    bbox = draw.textbbox((0, 0), step_num, font=FONT_STEP_NUM)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((170 - tw//2, 285 - th//2 + 10), step_num, fill=TEXT_WHITE, font=FONT_STEP_NUM)
    
    # Step label
    draw.text((120, 200), f"STEP {step_idx + 1} OF {len(lesson['steps'])}", fill=ACCENT, font=FONT_BADGE)
    
    # Step text
    wrapped = textwrap.wrap(step_text, width=40)
    y = 270
    for line in wrapped:
        draw.text((280, y), line, fill=TEXT_WHITE, font=FONT_HEADING)
        y += 50
    
    # Visual panel (simulated UI screenshot area)
    panel_x, panel_y = 280, y + 30
    panel_w, panel_h = W - 360, H - y - 120
    if panel_h > 100:
        draw_rounded_rect(draw, [panel_x, panel_y, panel_x + panel_w, panel_y + panel_h], 
                         radius=12, fill=SURFACE, outline=BORDER, width=2)
        
        # Fake UI elements inside panel
        # Title bar
        draw.rectangle([panel_x + 1, panel_y + 1, panel_x + panel_w - 1, panel_y + 40], fill=(20, 20, 40))
        draw.ellipse([panel_x + 15, panel_y + 13, panel_x + 27, panel_y + 25], fill=(255, 95, 87))
        draw.ellipse([panel_x + 35, panel_y + 13, panel_x + 47, panel_y + 25], fill=(255, 189, 46))
        draw.ellipse([panel_x + 55, panel_y + 13, panel_x + 67, panel_y + 25], fill=(39, 201, 63))
        
        # Simulated content blocks
        block_y = panel_y + 60
        for j in range(3):
            bw = min(panel_w - 80, 300 + j * 80)
            draw_rounded_rect(draw, [panel_x + 30, block_y, panel_x + 30 + bw, block_y + 30],
                             radius=6, fill=BORDER)
            block_y += 50
        
        # Connection lines (workflow feel)
        if panel_h > 300:
            mid_x = panel_x + panel_w // 2
            for j in range(2):
                start_y = panel_y + 120 + j * 80
                draw.line([mid_x, start_y, mid_x, start_y + 30], fill=ACCENT, width=2)
                # Arrow
                draw.polygon([(mid_x-6, start_y+24), (mid_x+6, start_y+24), (mid_x, start_y+34)], fill=ACCENT)
    
    # Bottom progress bar
    draw.rectangle([0, H-6, W, H], fill=SURFACE)
    progress_w = int((step_idx + 1) / len(lesson['steps']) * W)
    draw.rectangle([0, H-6, progress_w, H], fill=ACCENT)
    
    return img

def create_challenge_slide(lesson):
    """Final slide: Challenge card"""
    img = Image.new('RGB', (W, H), BG)
    draw = ImageDraw.Draw(img)
    
    # Header
    draw.rectangle([0, 0, W, 6], fill=ORANGE)
    
    # Challenge icon area
    draw_rounded_rect(draw, [W//2 - 40, 200, W//2 + 40, 280], radius=16, fill=ORANGE)
    draw.text((W//2 - 15, 218), "🛠", fill=TEXT_WHITE, font=FONT_HEADING)
    
    # Title
    title = "YOUR CHALLENGE"
    bbox = draw.textbbox((0, 0), title, font=FONT_HEADING)
    tw = bbox[2] - bbox[0]
    draw.text((W//2 - tw//2, 310), title, fill=ORANGE, font=FONT_HEADING)
    
    # Challenge description
    challenge = lesson['steps'][-1]  # Use last step as challenge summary
    wrapped = textwrap.wrap(f"Complete all steps and submit your proof to mark Lesson {lesson['id']} as done.", width=55)
    y = 390
    for line in wrapped:
        bbox = draw.textbbox((0, 0), line, font=FONT_BODY)
        tw = bbox[2] - bbox[0]
        draw.text((W//2 - tw//2, y), line, fill=TEXT_LIGHT, font=FONT_BODY)
        y += 40
    
    # Steps checklist
    y += 20
    for i, step in enumerate(lesson['steps']):
        check = "✓" 
        text = f"  {step}"
        truncated = text[:60] + "..." if len(text) > 60 else text
        draw.text((W//2 - 280, y), check, fill=GREEN, font=FONT_BODY)
        draw.text((W//2 - 250, y), truncated, fill=TEXT_GRAY, font=FONT_SMALL)
        y += 35
    
    # Bottom
    draw.rectangle([0, H-4, W, H], fill=ORANGE)
    
    return img

# ── Audio Generation ────────────────────────────────────────────────────────

def generate_voiceover(text, output_path, voice="nova"):
    """Generate TTS audio using OpenAI"""
    import openai
    client = openai.OpenAI(api_key=OPENAI_API_KEY)
    
    print(f"  🎤 Generating voiceover ({len(text)} chars)...")
    response = client.audio.speech.create(
        model="tts-1",
        voice=voice,
        input=text,
        speed=1.0
    )
    response.stream_to_file(str(output_path))
    return output_path

# ── Video Assembly ──────────────────────────────────────────────────────────

def get_audio_duration(path):
    """Get audio duration in seconds"""
    result = subprocess.run(
        ['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration', 
         '-of', 'default=noprint_wrappers=1:nokey=1', str(path)],
        capture_output=True, text=True
    )
    return float(result.stdout.strip())

def create_video(lesson, slides, audio_path, output_path):
    """Combine slides + audio into video using ffmpeg"""
    audio_duration = get_audio_duration(audio_path)
    num_slides = len(slides)
    
    # Distribute time: title gets more, steps are even, challenge gets more
    title_time = audio_duration * 0.15
    challenge_time = audio_duration * 0.15
    step_time = (audio_duration - title_time - challenge_time) / max(num_slides - 2, 1)
    
    # Create concat file
    concat_file = TEMP_DIR / f"lesson{lesson['id']}_concat.txt"
    with open(concat_file, 'w') as f:
        for i, slide_path in enumerate(slides):
            if i == 0:
                dur = title_time
            elif i == len(slides) - 1:
                dur = challenge_time
            else:
                dur = step_time
            f.write(f"file '{slide_path}'\n")
            f.write(f"duration {dur:.2f}\n")
        # Repeat last frame (ffmpeg concat requirement)
        f.write(f"file '{slides[-1]}'\n")
    
    # Build video with slides + audio
    cmd = [
        'ffmpeg', '-y',
        '-f', 'concat', '-safe', '0', '-i', str(concat_file),
        '-i', str(audio_path),
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
        '-c:a', 'aac', '-b:a', '128k',
        '-pix_fmt', 'yuv420p',
        '-vf', 'scale=1920:1080',
        '-shortest',
        '-movflags', '+faststart',
        str(output_path)
    ]
    
    print(f"  🎬 Rendering video ({audio_duration:.1f}s)...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  ❌ ffmpeg error: {result.stderr[-500:]}")
        return None
    
    return output_path

# ── Main Pipeline ───────────────────────────────────────────────────────────

def generate_lesson_video(lesson):
    """Full pipeline for one lesson"""
    lesson_id = lesson['id']
    print(f"\n{'='*60}")
    print(f"📹 Lesson {lesson_id}: {lesson['title']}")
    print(f"{'='*60}")
    
    lesson_dir = TEMP_DIR / f"lesson{lesson_id:02d}"
    lesson_dir.mkdir(exist_ok=True)
    
    # 1. Generate slides
    print("  🖼️  Generating slides...")
    slides = []
    
    # Title slide
    title_path = lesson_dir / "slide_00_title.png"
    create_title_slide(lesson).save(str(title_path), quality=95)
    slides.append(str(title_path))
    
    # Step slides
    for i, step in enumerate(lesson['steps']):
        step_path = lesson_dir / f"slide_{i+1:02d}_step.png"
        create_step_slide(lesson, i, step).save(str(step_path), quality=95)
        slides.append(str(step_path))
    
    # Challenge slide
    challenge_path = lesson_dir / "slide_99_challenge.png"
    create_challenge_slide(lesson).save(str(challenge_path), quality=95)
    slides.append(str(challenge_path))
    
    print(f"  ✓ {len(slides)} slides created")
    
    # 2. Generate voiceover
    audio_path = lesson_dir / "voiceover.mp3"
    if not audio_path.exists():
        generate_voiceover(lesson['narration'], audio_path)
    else:
        print(f"  ✓ Voiceover already exists, skipping")
    
    # 3. Render video
    output_path = OUTPUT_DIR / f"lesson-{lesson_id:02d}.mp4"
    result = create_video(lesson, slides, audio_path, output_path)
    
    if result:
        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        duration = get_audio_duration(output_path)
        print(f"  ✅ Done! {output_path.name} ({size_mb:.1f}MB, {duration:.0f}s)")
        return str(output_path)
    else:
        print(f"  ❌ Failed to render lesson {lesson_id}")
        return None


def main():
    print("🎬 Opus Mastery Video Generator")
    print(f"   Output: {OUTPUT_DIR}")
    print(f"   Lessons: 12")
    print()
    
    results = []
    for lesson in LESSONS:
        path = generate_lesson_video(lesson)
        results.append({"id": lesson['id'], "path": path, "ok": path is not None})
    
    # Summary
    print(f"\n{'='*60}")
    print("📊 SUMMARY")
    print(f"{'='*60}")
    ok = sum(1 for r in results if r['ok'])
    print(f"✅ {ok}/12 videos generated")
    for r in results:
        status = "✅" if r['ok'] else "❌"
        print(f"  {status} Lesson {r['id']}: {r['path'] or 'FAILED'}")
    
    if ok == 12:
        print(f"\n🎉 All videos ready in {OUTPUT_DIR}")
        print("Next: Update lesson videoUrl fields to point to /videos/lesson-XX.mp4")


if __name__ == '__main__':
    main()
