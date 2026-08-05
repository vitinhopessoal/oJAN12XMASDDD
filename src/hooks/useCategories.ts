import { mockCategories } from "@/mocks/data";
import type { Category } from "@/types";

// MOCK: será substituído pelo PocketBase.
export function useCategories(): { categories: Category[] } {
  return { categories: mockCategories };
}

export function useCategoryMap(): Record<string, Category> {
  return Object.fromEntries(mockCategories.map((c) => [c.id, c]));
}
