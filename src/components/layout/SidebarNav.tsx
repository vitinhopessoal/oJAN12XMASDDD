import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarRange,
  ArrowLeftRight,
  Landmark,
  Tags,
  PieChart,
  Moon,
  Sun,
  PiggyBank,
  TrendingUp,
  Inbox,
} from "lucide-react";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useInbox } from "@/hooks/useInbox";

const nav = [
  { to: "/entrada", label: "Caixa de entrada", icon: Inbox },
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/planejamento", label: "Planejamento", icon: CalendarRange },
  { to: "/investimentos", label: "Investimentos", icon: TrendingUp },
  { to: "/transacoes", label: "Transações", icon: ArrowLeftRight },
  { to: "/contas", label: "Contas", icon: Landmark },
  { to: "/categorias", label: "Categorias", icon: Tags },
  { to: "/relatorios", label: "Relatórios", icon: PieChart },
] as const;

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { theme, toggleTheme } = useAppSettings();
  const { count } = useInbox();


  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <PiggyBank className="h-5 w-5" />
        </span>
        <span className="text-lg font-semibold tracking-tight">Meu Bolso</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            activeOptions={{ exact: item.to === "/" }}
            activeProps={{
              className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
            }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/60"
          >
            <item.icon className="h-4 w-4" />
            <span className="flex-1">{item.label}</span>
            {item.to === "/entrada" && count > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                {count}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/60"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Modo claro" : "Modo escuro"}
        </button>
      </div>
    </div>
  );
}
