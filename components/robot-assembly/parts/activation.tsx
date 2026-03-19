import type { SVGProps } from "react";

export function Activation(props: SVGProps<SVGGElement>) {
  return (
    <g data-part="activation" {...props}>
      <g className="robot-eyes-activated">
        <circle cx="194" cy="168" r="4.5" fill="#93C5FD" />
        <circle cx="206" cy="168" r="4.5" fill="#93C5FD" />
      </g>

      <g className="robot-flame-flicker">
        <path d="M158 244 C153 252, 152 260, 160 266 C168 260, 166 251, 162 244 Z" fill="#F59E0B" opacity="0.9" />
        <path d="M234 244 C229 252, 228 260, 236 266 C244 260, 242 251, 238 244 Z" fill="#F59E0B" opacity="0.9" />
        <path d="M160 249 C157 254, 158 260, 161 263 C164 259, 164 253, 162 249 Z" fill="#EF4444" />
        <path d="M236 249 C233 254, 234 260, 237 263 C240 259, 240 253, 238 249 Z" fill="#EF4444" />
      </g>

      <g className="robot-particle-burst" fill="#A5B4FC">
        <circle cx="150" cy="126" r="2" />
        <circle cx="168" cy="114" r="1.6" />
        <circle cx="248" cy="118" r="1.8" />
        <circle cx="264" cy="132" r="2" />
        <circle cx="200" cy="102" r="2.2" />
      </g>
    </g>
  );
}
