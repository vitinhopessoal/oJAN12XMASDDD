import { icons } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryIconProps {
  name: string;
  className?: string;
}

export function CategoryIcon({ name, className }: CategoryIconProps) {
  const Icon = icons[name as keyof typeof icons] ?? icons.Circle;
  return <Icon className={cn("h-4 w-4", className)} />;
}
