/** Paleta fixa de 12 tons usada para colorir categorias de forma determinística. */
export const CHART_PALETTE = [
  "#087F5B",
  "#0CA678",
  "#2F9E44",
  "#F59F00",
  "#F76707",
  "#DC2626",
  "#E64980",
  "#AE3EC9",
  "#7048E8",
  "#4263EB",
  "#1098AD",
  "#5C7CFA",
];

/** Índice estável a partir do id da categoria. */
export function colorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return CHART_PALETTE[hash % CHART_PALETTE.length] as string;
}
