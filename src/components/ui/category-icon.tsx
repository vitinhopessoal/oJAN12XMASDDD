import { icons } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryIconProps {
  name: string;
  className?: string;
}

/** Aceita "heart-pulse" ou "HeartPulse". */
export function toPascalIconName(name: string): string {
  if (!name) return "Circle";
  if (/^[A-Z]/.test(name)) return name;
  return name
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function CategoryIcon({ name, className }: CategoryIconProps) {
  const Icon = icons[toPascalIconName(name) as keyof typeof icons] ?? icons.Circle;
  return <Icon className={cn("h-4 w-4", className)} />;
}
