import type { SVGProps } from "react";

export function Workbench(props: SVGProps<SVGGElement>) {
  return (
    <g data-part="workbench" {...props}>
      <rect x="50" y="250" width="300" height="20" rx="8" fill="#1a1a36" stroke="#2A2A4A" strokeWidth="2" />
      <rect x="75" y="270" width="250" height="16" rx="6" fill="#12122A" stroke="#2A2A4A" strokeWidth="1.5" />

      <path
        d="M165 220 L165 160 L180 145 L220 145 L235 160 L235 220"
        fill="none"
        stroke="rgba(99, 102, 241, 0.35)"
        strokeWidth="2"
        strokeDasharray="5 6"
      />
      <path
        d="M165 180 L145 190 M235 180 L255 190 M175 220 L160 250 M225 220 L240 250"
        fill="none"
        stroke="rgba(99, 102, 241, 0.25)"
        strokeWidth="2"
        strokeDasharray="5 6"
      />
      <circle cx="200" cy="178" r="9" fill="none" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1.5" />
    </g>
  );
}
