import type { SVGProps } from "react";

export function Armor(props: SVGProps<SVGGElement>) {
  return (
    <g data-part="armor" {...props}>
      <path
        d="M166 185 q34 -20 68 0 v54 q-34 24 -68 0z"
        fill="rgba(58, 58, 90, 0.72)"
        stroke="#6366F1"
        strokeWidth="1.5"
      />
      <rect x="176" y="190" width="48" height="8" rx="4" fill="#6366F1" opacity="0.25" />
      <path d="M170 214 h60" stroke="#3A3A5A" strokeWidth="2" opacity="0.7" />
      <path d="M170 227 h60" stroke="#3A3A5A" strokeWidth="2" opacity="0.55" />
    </g>
  );
}
