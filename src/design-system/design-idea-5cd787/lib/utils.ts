import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with conflict resolution.
 * Combines clsx (conditional) + tailwind-merge (dedupe conflicting utilities).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
