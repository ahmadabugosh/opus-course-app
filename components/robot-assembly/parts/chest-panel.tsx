import type { SVGProps } from "react";

export function ChestPanel(props: SVGProps<SVGGElement>) {
  return (
    <g data-part="chest-panel" {...props}>
      <rect x="172" y="186" width="56" height="30" rx="8" fill="#1A1A36" stroke="#3A3A5A" strokeWidth="2" />
      <rect x="180" y="193" width="40" height="14" rx="5" fill="#0f172a" stroke="#2A2A4A" strokeWidth="1" />
      <path
        d="M183 200 h6 l3 -4 l4 8 l4 -8 l3 4 h8"
        fill="none"
        stroke="#10B981"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="223" cy="201" r="2.2" fill="#10B981" opacity="0.85" />
    </g>
  );
}
