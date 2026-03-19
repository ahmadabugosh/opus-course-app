import type { SVGProps } from "react";

export function RightLeg(props: SVGProps<SVGGElement>) {
  return (
    <g data-part="right-leg" {...props}>
      <rect x="210" y="250" width="16" height="28" rx="5" fill="#2A2A4A" stroke="#3A3A5A" strokeWidth="2" />
      <rect x="204" y="276" width="28" height="10" rx="5" fill="#1A1A36" stroke="#3A3A5A" strokeWidth="1.5" />
      <circle cx="236" cy="281" r="6" fill="#12122A" stroke="#6366F1" strokeWidth="1.8" />
      <path d="M233 281 h6" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  );
}
