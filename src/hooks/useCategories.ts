import { useQuery } from "@tanstack/react-query";

import { isBrowser, mapCategory, pb } from "@/lib/pocketbase";
import type { Category } from "@/types";

async function fetchCategories(): Promise<Category[]> {
  const records = await pb.collection("categories").getFullList({ sort: "name" });
  return records.map(mapCategory);
}

export function useCategories(): {
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
} {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: isBrowser,
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useCategoryMap(): Record<string, Category> {
  const { categories } = useCategories();
  return Object.fromEntries(categories.map((c) => [c.id, c]));
}
