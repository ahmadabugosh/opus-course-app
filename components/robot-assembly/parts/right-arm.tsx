import type { SVGProps } from "react";

export function RightArm(props: SVGProps<SVGGElement>) {
  return (
    <g data-part="right-arm" {...props}>
      <rect x="236" y="185" width="24" height="14" rx="7" fill="#3A3A5A" />
      <rect x="258" y="192" width="22" height="12" rx="6" fill="#2A2A4A" stroke="#3A3A5A" strokeWidth="2" />
      <rect x="280" y="198" width="16" height="10" rx="4" fill="#2A2A4A" stroke="#6366F1" strokeWidth="1.5" />
      <circle cx="303" cy="203" r="7" fill="#12122A" stroke="#6366F1" strokeWidth="1.8" />
      <circle cx="303" cy="203" r="2" fill="#10B981" opacity="0.9" />
      <path d="M296 203 h14 M303 196 v14" stroke="#6366F1" strokeWidth="1.2" opacity="0.7" />
    </g>
  );
}
