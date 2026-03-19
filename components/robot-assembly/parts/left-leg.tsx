import type { SVGProps } from "react";

export function LeftLeg(props: SVGProps<SVGGElement>) {
  return (
    <g data-part="left-leg" {...props}>
      <rect x="174" y="250" width="16" height="28" rx="5" fill="#2A2A4A" stroke="#3A3A5A" strokeWidth="2" />
      <rect x="168" y="276" width="28" height="10" rx="5" fill="#1A1A36" stroke="#3A3A5A" strokeWidth="1.5" />
      <rect x="164" y="284" width="36" height="6" rx="3" fill="#111128" />
      <path d="M170 287 h24" stroke="#6366F1" strokeWidth="1.2" opacity="0.6" />
    </g>
  );
}
