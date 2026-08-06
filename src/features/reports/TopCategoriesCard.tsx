import { CategoryIcon } from "@/components/ui/category-icon";
import { CurrencyText } from "@/components/ui/currency-text";
import { Progress } from "@/components/ui/progress";
import { colorForId } from "./palette";
import type { Category } from "@/types";

interface TopCategoriesCardProps {
  data: { categoryId: string; total: number }[];
  categories: Record<string, Category>;
}

export function TopCategoriesCard({ data, categories }: TopCategoriesCardProps) {
  const total = data.reduce((sum, d) => sum + d.total, 0);
  const top = data.slice(0, 5);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="text-base font-semibold">Top 5 categorias do mês</h2>
      {top.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nenhuma despesa no mês selecionado.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {top.map((item) => {
            const category = categories[item.categoryId];
            const pct = total > 0 ? (item.total / total) * 100 : 0;
            const color = colorForId(item.categoryId);
            return (
              <li key={item.categoryId} className="space-y-2">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${color}1f`, color }}
                  >
                    <CategoryIcon name={category?.icon ?? "circle"} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {category?.name ?? "Sem categoria"}
                  </span>
                  <div className="text-right">
                    <CurrencyText value={item.total} className="block text-sm font-medium" />
                    <span className="text-xs text-muted-foreground">{pct.toFixed(1)}%</span>
                  </div>
                </div>
                <Progress value={pct} className="h-1.5" />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
