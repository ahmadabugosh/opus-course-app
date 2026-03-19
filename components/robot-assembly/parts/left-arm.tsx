import type { SVGProps } from "react";

export function LeftArm(props: SVGProps<SVGGElement>) {
  return (
    <g data-part="left-arm" {...props}>
      <rect x="140" y="185" width="24" height="14" rx="7" fill="#3A3A5A" />
      <rect x="122" y="192" width="22" height="12" rx="6" fill="#2A2A4A" stroke="#3A3A5A" strokeWidth="2" />
      <rect x="106" y="198" width="18" height="10" rx="4" fill="#2A2A4A" stroke="#6366F1" strokeWidth="1.5" />
      <path d="M94 202 l10 -8 l3 3 l-8 10" fill="none" stroke="#9CA3CF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M90 206 l9 -4" stroke="#9CA3CF" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}
