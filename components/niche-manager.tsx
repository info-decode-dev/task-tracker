"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createWorkspaceNiche,
  deleteWorkspaceNiche,
} from "@/app/actions/niches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WorkspaceNiche } from "@/lib/types";
import { Loader2, Plus, Target, Trash2 } from "lucide-react";

type NicheManagerProps = {
  niches: WorkspaceNiche[];
};

export function NicheManager({ niches }: NicheManagerProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await createWorkspaceNiche(message);
        setMessage("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add niche");
      }
    });
  };

  const handleDelete = (id: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await deleteWorkspaceNiche(id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove niche");
      }
    });
  };

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <Target className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Workspace niches
          </h2>
          <p className="text-sm text-muted-foreground">
            Pinned goals shown below the navbar. Multiple niches rotate every 5
            seconds.
          </p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="The niche to achieve…"
          disabled={isPending}
          className="h-10"
        />
        <Button
          type="submit"
          className="h-10 shrink-0 gap-1.5 px-4"
          disabled={isPending || !message.trim()}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add
        </Button>
      </form>

      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}

      <ul className="mt-4 space-y-2">
        {niches.length === 0 ? (
          <li className="rounded-lg border border-dashed border-border/80 px-3 py-4 text-center text-sm text-muted-foreground">
            No niches yet. Add one to motivate your team.
          </li>
        ) : (
          niches.map((niche) => (
            <li
              key={niche.id}
              className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5"
            >
              <p className="min-w-0 flex-1 text-sm">{niche.message}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(niche.id)}
                disabled={isPending}
                aria-label={`Remove niche: ${niche.message}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
