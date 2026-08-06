import { isBrowser } from "@/lib/pocketbase";

export const MILESTONES = [25, 50, 75, 100] as const;

/** Maior marco cruzado entre dois percentuais, ou null. */
export function crossedMilestone(before: number, after: number): number | null {
  const crossed = MILESTONES.filter((m) => before < m && after >= m);
  return crossed.length ? (crossed[crossed.length - 1] as number) : null;
}

/** Confete — só no cliente. */
export async function celebrate(): Promise<void> {
  if (!isBrowser) return;
  const confetti = (await import("canvas-confetti")).default;
  void confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 } });
  window.setTimeout(() => {
    void confetti({ particleCount: 60, spread: 100, origin: { y: 0.6 } });
  }, 250);
}

const MONTHS_ABBR = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

export function monthAbbrLabel(date: Date): string {
  return `${MONTHS_ABBR[date.getMonth()]}/${date.getFullYear()}`;
}

export function monthKeyLabel(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTHS_ABBR[Number(m) - 1] ?? "?"}/${y}`;
}

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
