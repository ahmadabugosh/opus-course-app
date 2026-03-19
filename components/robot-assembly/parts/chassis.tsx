import type { SVGProps } from "react";

export function Chassis(props: SVGProps<SVGGElement>) {
  return (
    <g data-part="chassis" {...props}>
      <rect x="162" y="198" width="76" height="52" rx="12" fill="#2A2A4A" stroke="#3A3A5A" strokeWidth="2" />
      <rect x="155" y="210" width="90" height="18" rx="9" fill="#34345a" />
      <rect x="178" y="204" width="44" height="7" rx="3.5" fill="#6366F1" opacity="0.4" />
      <circle cx="171" cy="224" r="3" fill="#10B981" opacity="0.7" />
      <circle cx="229" cy="224" r="3" fill="#10B981" opacity="0.7" />
    </g>
  );
}
