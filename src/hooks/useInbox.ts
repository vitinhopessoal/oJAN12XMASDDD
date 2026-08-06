import { useQuery } from "@tanstack/react-query";

import { isBrowser, mapTransaction, pb } from "@/lib/pocketbase";
import type { Transaction } from "@/types";

async function fetchInbox(): Promise<Transaction[]> {
  const records = await pb.collection("transactions").getFullList({
    sort: "-date",
    filter: "needsReview = true",
  });
  return records.map(mapTransaction);
}

export function useInbox(): {
  items: Transaction[];
  count: number;
  isLoading: boolean;
  error: Error | null;
} {
  const query = useQuery({
    queryKey: ["inbox"],
    queryFn: fetchInbox,
    enabled: isBrowser,
  });

  const items = query.data ?? [];

  return {
    items,
    count: items.length,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}
