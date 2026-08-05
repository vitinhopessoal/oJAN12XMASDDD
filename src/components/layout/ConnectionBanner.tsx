import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isBrowser, pb, POCKETBASE_URL } from "@/lib/pocketbase";
import { ensureDefaultCategories } from "@/lib/seed";

const host = POCKETBASE_URL.replace(/^https?:\/\//, "");

export function ConnectionBanner() {
  const queryClient = useQueryClient();
  const { isError, refetch, isSuccess } = useQuery({
    queryKey: ["pb-health"],
    queryFn: async () => {
      await pb.health.check();
      return true;
    },
    enabled: isBrowser,
    retry: 1,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (isSuccess)
      void ensureDefaultCategories().then(() => {
        void queryClient.invalidateQueries({ queryKey: ["categories"] });
      });
  }, [isSuccess, queryClient]);

  if (!isError) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-pending/30 bg-pending-soft px-4 py-2 text-xs text-pending">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1">
        Não foi possível conectar ao servidor ({host}). Verifique se o PocketBase está rodando.
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs"
        onClick={() => {
          void refetch();
          void queryClient.invalidateQueries();
        }}
      >
        <RefreshCw className="h-3.5 w-3.5" /> Tentar novamente
      </Button>
    </div>
  );
}
