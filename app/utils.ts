import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function that combines clsx and tailwind-merge
 * - clsx: Combines multiple class names and resolves conditionals
 * - tailwind-merge: Intelligently merges Tailwind CSS classes without conflicts
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
