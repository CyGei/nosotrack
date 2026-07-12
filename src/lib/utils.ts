// Standard shadcn / Tailwind utility for conditional class joining.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Clamp a number to the [0, 1] range. */
export function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
