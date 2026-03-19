import type { SVGProps } from "react";

export function Processor(props: SVGProps<SVGGElement>) {
  return (
    <g data-part="processor" {...props}>
      <rect x="184" y="206" width="32" height="32" rx="6" fill="#1a1a36" stroke="#6366F1" strokeWidth="2" />
      <rect x="190" y="212" width="20" height="20" rx="4" fill="#6366F1" opacity="0.65" className="robot-core-glow" />
      <path
        d="M178 212 h-7 M178 220 h-7 M178 228 h-7 M223 212 h7 M223 220 h7 M223 228 h7"
        stroke="#3A3A5A"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
}
