import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function scaleIngredient(amount: string, factor: number): string {
  // Parse numeric values and scale them
  return amount.replace(/(\d+\.?\d*)/g, (match) => {
    const num = parseFloat(match) * factor;
    // Round to 2 decimal places and remove trailing zeros
    return parseFloat(num.toFixed(2)).toString();
  });
}
