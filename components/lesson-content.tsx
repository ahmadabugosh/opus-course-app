import type { ReactNode } from 'react';

import CodeBlock from './code-block';

type LessonContentProps = {
  markdown: string;
};

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);

  for (const part of parts) {
    if (part.startsWith('`') && part.endsWith('`')) {
      nodes.push(
        <code key={`${part}-${nodes.length}`} className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-indigo-200">
          {part.slice(1, -1)}
        </code>,
      );
    } else if (part.startsWith('**') && part.endsWith('**')) {
      nodes.push(
        <strong key={`${part}-${nodes.length}`} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(<span key={`${part}-${nodes.length}`}>{part}</span>);
    }
  }

  return nodes;
}

function renderCallout(line: string, index: number) {
  const infoMatch = line.match(/^>\s*\[!(INFO|WARNING)\]\s*(.*)$/i);
  if (!infoMatch) {
    return null;
  }

  const type = infoMatch[1].toUpperCase();
  const text = infoMatch[2];
  const baseClasses = 'my-4 rounded-lg border px-4 py-3 text-sm';
  const classes =
    type === 'WARNING'
      ? `${baseClasses} border-amber-500/30 bg-amber-500/10 text-amber-100`
      : `${baseClasses} border-cyan-500/30 bg-cyan-500/10 text-cyan-100`;

  return (
    <div key={`callout-${index}`} className={classes}>
      <p className="font-medium">{type === 'WARNING' ? '⚠ Warning' : 'ℹ Info'}</p>
      <p className="mt-1">{parseInline(text)}</p>
    </div>
  );
}

export default function LessonContent({ markdown }: LessonContentProps) {
  const body = markdown.replace(/^---[\s\S]*?---\n?/, '').trim();
  const blocks = body.split('\n\n');

  return (
    <article className="prose prose-invert max-w-none space-y-4">
      {blocks.map((block, index) => {
        const callout = renderCallout(block.trim(), index);
        if (callout) {
          return callout;
        }

        if (block.startsWith('```')) {
          const lines = block.split('\n');
          const language = lines[0].replace(/```/, '').trim() || 'text';
          const code = lines.slice(1, -1).join('\n');
          return <CodeBlock key={`code-${index}`} code={code} language={language} />;
        }

        if (block.startsWith('# ')) {
          return (
            <h1 key={`h1-${index}`} className="text-3xl font-bold text-white">
              {block.replace(/^#\s/, '')}
            </h1>
          );
        }

        if (block.startsWith('## ')) {
          return (
            <h2 key={`h2-${index}`} className="text-2xl font-semibold text-white">
              {block.replace(/^##\s/, '')}
            </h2>
          );
        }

        if (block.startsWith('- ')) {
          const items = block
            .split('\n')
            .filter((line) => line.startsWith('- '))
            .map((line) => line.replace(/^-\s/, '').trim());

          return (
            <ul key={`ul-${index}`} className="list-disc space-y-2 pl-6 text-gray-200">
              {items.map((item, i) => (
                <li key={`${item}-${i}`}>{parseInline(item)}</li>
              ))}
            </ul>
          );
        }

        const imageMatch = block.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imageMatch) {
          const alt = imageMatch[1] || 'Lesson image';
          const src = imageMatch[2];
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`img-${index}`}
              src={src}
              alt={alt}
              className="my-4 w-full rounded-xl border border-white/10"
            />
          );
        }

        return (
          <p key={`p-${index}`} className="leading-7 text-gray-200">
            {parseInline(block.replace(/\n/g, ' '))}
          </p>
        );
      })}
    </article>
  );
}
