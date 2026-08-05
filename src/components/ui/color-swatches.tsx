import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export const COLOR_PALETTE = [
  "#820AD1",
  "#EC7000",
  "#087F5B",
  "#1D4ED8",
  "#DC2626",
  "#DB2777",
  "#F59E0B",
  "#0D9488",
  "#4F46E5",
  "#6B7280",
  "#92400E",
  "#111827",
];

interface ColorSwatchesProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorSwatches({ value, onChange }: ColorSwatchesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_PALETTE.map((color) => {
        const selected = value.toLowerCase() === color.toLowerCase();
        return (
          <button
            key={color}
            type="button"
            aria-label={`Cor ${color}`}
            aria-pressed={selected}
            onClick={() => onChange(color)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition",
              selected && "ring-2 ring-ring",
            )}
            style={{ backgroundColor: color }}
          >
            {selected ? <Check className="h-4 w-4 text-white" /> : null}
          </button>
        );
      })}
    </div>
  );
}
