import { ScrollArea } from "@/components/ui/scroll-area";
import { CategoryIcon } from "@/components/ui/category-icon";
import { cn } from "@/lib/utils";

export const FINANCE_ICONS = [
  "utensils",
  "car",
  "home",
  "heart-pulse",
  "gamepad-2",
  "graduation-cap",
  "repeat",
  "shopping-cart",
  "shirt",
  "plane",
  "fuel",
  "wifi",
  "smartphone",
  "gift",
  "baby",
  "dog",
  "wrench",
  "scissors",
  "dumbbell",
  "film",
  "music",
  "book-open",
  "coffee",
  "pizza",
  "bus",
  "briefcase",
  "laptop",
  "trending-up",
  "coins",
  "banknote",
  "piggy-bank",
  "wallet",
  "credit-card",
  "receipt",
  "landmark",
  "hand-coins",
  "circle-dollar-sign",
  "sparkles",
  "tag",
  "shield",
  "gem",
  "umbrella",
  "rocket",
  "target",
  "circle",
];

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <ScrollArea className="h-44 rounded-xl border border-border p-2">
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
        {FINANCE_ICONS.map((icon) => {
          const selected = value === icon;
          return (
            <button
              key={icon}
              type="button"
              aria-label={icon}
              aria-pressed={selected}
              onClick={() => onChange(icon)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border border-transparent bg-muted text-muted-foreground transition hover:bg-accent",
                selected && "border-primary bg-primary-soft text-primary",
              )}
            >
              <CategoryIcon name={icon} />
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
