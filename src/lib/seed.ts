import { pb } from "./pocketbase";

const DEFAULTS: { name: string; icon: string; type: "INCOME" | "EXPENSE" }[] = [
  { name: "Alimentação", icon: "utensils", type: "EXPENSE" },
  { name: "Transporte", icon: "car", type: "EXPENSE" },
  { name: "Moradia", icon: "home", type: "EXPENSE" },
  { name: "Saúde", icon: "heart-pulse", type: "EXPENSE" },
  { name: "Lazer", icon: "gamepad-2", type: "EXPENSE" },
  { name: "Educação", icon: "graduation-cap", type: "EXPENSE" },
  { name: "Assinaturas", icon: "repeat", type: "EXPENSE" },
  { name: "Outros", icon: "circle-dollar-sign", type: "EXPENSE" },
  { name: "Salário", icon: "briefcase", type: "INCOME" },
  { name: "Freelance", icon: "laptop", type: "INCOME" },
  { name: "Investimentos", icon: "trending-up", type: "INCOME" },
  { name: "Outros", icon: "coins", type: "INCOME" },
];

let done = false;

/** Cria as categorias padrão se a collection estiver vazia. Nunca lança erro. */
export async function ensureDefaultCategories(): Promise<void> {
  if (done || typeof window === "undefined") return;
  done = true;
  try {
    const existing = await pb.collection("categories").getList(1, 1);
    if (existing.totalItems > 0) return;
    for (const category of DEFAULTS) {
      await pb.collection("categories").create(category);
    }
  } catch {
    // PocketBase indisponível — o banner de conexão avisa o usuário.
    done = false;
  }
}
