import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MONTHS_LONG } from "@/lib/utils";

interface MonthSelectorProps {
  monthIndex: number;
  year: number;
  onChange: (monthIndex: number, year: number) => void;
}

export function MonthSelector({ monthIndex, year, onChange }: MonthSelectorProps) {
  const shift = (delta: number) => {
    const next = monthIndex + delta;
    if (next < 0) onChange(11, year - 1);
    else if (next > 11) onChange(0, year + 1);
    else onChange(next, year);
  };

  const resetToToday = () => {
    const today = new Date();
    onChange(today.getMonth(), today.getFullYear());
  };

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-card px-1 py-1 shadow-soft">
      <Button variant="ghost" size="icon" onClick={() => shift(-1)} aria-label="Mês anterior">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <button
        type="button"
        onClick={resetToToday}
        title="Voltar para o mês atual"
        className="min-w-[140px] rounded-lg px-2 py-1 text-center text-sm font-medium transition hover:bg-accent"
      >
        {MONTHS_LONG[monthIndex]} {year}
      </button>
      <Button variant="ghost" size="icon" onClick={() => shift(1)} aria-label="Próximo mês">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
