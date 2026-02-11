"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block", className)}
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Brain shape */}
      <path
        d="M14 16c0-3 2-5 5-5s5 2 5 5c2 0 4 1.5 4 4s-2 4-4 4c0 2.5-2 4.5-5 4.5s-5-2-5-4.5c-2 0-4-1.5-4-4s2-4 4-4z"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Brain center line */}
      <path
        d="M19.5 11v12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Brain wrinkles */}
      <path
        d="M15 16c2 1 4 1 4 1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M15 20c2-0.5 4-0.5 4-0.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M24 16c-2 1-4 1-4 1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M24 20c-2-0.5-4-0.5-4-0.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Lightning bolt for "rot" / energy */}
      <path
        d="M27 8l-3 5h4l-3 5"
        stroke="#EF3604"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
