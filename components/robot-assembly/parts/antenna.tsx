import type { SVGProps } from "react";

export function Antenna(props: SVGProps<SVGGElement>) {
  return (
    <g data-part="antenna" {...props}>
      <path d="M224 162 L242 150" stroke="#3A3A5A" strokeWidth="3" strokeLinecap="round" />
      <path d="M236 186 L268 170" stroke="#2A2A4A" strokeWidth="4" strokeLinecap="round" />
      <circle cx="271" cy="170" r="10" fill="#1A1A36" stroke="#6366F1" strokeWidth="2" />
      <circle cx="242" cy="150" r="4" fill="#6366F1" className="robot-core-glow" />
      <path d="M264 170 h14" stroke="#6366F1" strokeWidth="1.5" opacity="0.7" />
      <path d="M271 163 v14" stroke="#6366F1" strokeWidth="1.5" opacity="0.7" />
    </g>
  );
}
