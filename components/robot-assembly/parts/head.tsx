import type { SVGProps } from "react";

export function Head(props: SVGProps<SVGGElement>) {
  return (
    <g data-part="head" {...props}>
      <rect x="176" y="150" width="48" height="40" rx="10" fill="#2A2A4A" stroke="#3A3A5A" strokeWidth="2" />
      <rect x="187" y="163" width="26" height="10" rx="5" fill="#12122A" />
      <circle cx="194" cy="168" r="2.5" fill="#6366F1" opacity="0.7" />
      <circle cx="206" cy="168" r="2.5" fill="#6366F1" opacity="0.7" />
      <rect x="196" y="143" width="8" height="8" rx="3" fill="#3A3A5A" />
    </g>
  );
}
