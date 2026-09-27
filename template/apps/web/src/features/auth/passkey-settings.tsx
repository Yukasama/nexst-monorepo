"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Trash2 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/button/button";
import { authClient } from "@/lib/auth-client";

const PASSKEYS_QUERY_KEY = ["passkeys"];

/** Lists the signed-in user's passkeys and lets them add or delete one. */
export function PasskeySettings() {
  const t = useTranslations("Auth.Passkey");
  const format = useFormatter();
  const queryClient = useQueryClient();

  const { data: passkeys = [], isLoading } = useQuery({
    queryFn: async () => {
      const { data, error } = await authClient.passkey.listUserPasskeys();
      if (error) throw error;
      return data ?? [];
    },
    queryKey: PASSKEYS_QUERY_KEY,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: PASSKEYS_QUERY_KEY });

  const { isPending: isAdding, mutate: addPasskey } = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.passkey.addPasskey({ name: t("defaultName") });
      if (error) throw error;
    },
    onError: () => toast.error(t("addError")),
    onSuccess: async () => {
      await refresh();
      toast.success(t("added"));
    },
  });

  const { isPending: isDeleting, mutate: deletePasskey } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await authClient.passkey.deletePasskey({ id });
      if (error) throw error;
    },
    onError: () => toast.error(t("deleteError")),
    onSuccess: async () => {
      await refresh();
      toast.success(t("deleted"));
    },
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{t("description")}</p>
        </div>
        <Button className="shrink-0" isLoading={isAdding} onClick={() => addPasskey()} size="sm">
          {isAdding ? null : <KeyRound aria-hidden size={16} />}
          {t("add")}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">{t("loading")}</p>
      ) : passkeys.length === 0 ? (
        <p className="text-muted-foreground bg-card border-border rounded-xl border p-4 text-sm">
          {t("empty")}
        </p>
      ) : (
        <ul className="space-y-2">
          {passkeys.map((passkey) => {
            const name = passkey.name || t("fallbackName");
            return (
              <li
                className="bg-card border-border flex items-center gap-3 rounded-xl border p-4"
                key={passkey.id}
              >
                <KeyRound aria-hidden className="text-primary shrink-0" size={19} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{name}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {t("createdAt", {
                      date: format.dateTime(new Date(passkey.createdAt), { dateStyle: "medium" }),
                    })}
                  </p>
                </div>
                <Button
                  aria-label={t("deleteLabel", { name })}
                  disabled={isDeleting}
                  onClick={() => deletePasskey(passkey.id)}
                  size="icon"
                  variant="ghost"
                >
                  <Trash2 aria-hidden size={17} />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
