import type { SVGProps } from "react";

export function Jetpack(props: SVGProps<SVGGElement>) {
  return (
    <g data-part="jetpack" {...props}>
      <rect x="156" y="188" width="12" height="42" rx="5" fill="#2A2A4A" stroke="#3A3A5A" strokeWidth="2" />
      <rect x="232" y="188" width="12" height="42" rx="5" fill="#2A2A4A" stroke="#3A3A5A" strokeWidth="2" />
      <rect x="164" y="198" width="8" height="10" rx="3" fill="#6366F1" opacity="0.35" />
      <rect x="228" y="198" width="8" height="10" rx="3" fill="#6366F1" opacity="0.35" />
      <circle cx="162" cy="236" r="5" fill="#111128" stroke="#3A3A5A" strokeWidth="1.5" />
      <circle cx="238" cy="236" r="5" fill="#111128" stroke="#3A3A5A" strokeWidth="1.5" />
    </g>
  );
}
