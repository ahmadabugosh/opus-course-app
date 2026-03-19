'use client';

import { useState } from 'react';

type CodeBlockProps = {
  code: string;
  language?: string;
};

export default function CodeBlock({ code, language = 'text' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#111126]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="text-xs uppercase tracking-wider text-gray-400">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-white/20 px-2 py-1 text-xs text-gray-200 transition hover:bg-white/10"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-6 text-gray-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
