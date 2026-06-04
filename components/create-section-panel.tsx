"use client";

import { FolderPlus, X } from "lucide-react";
import { AddSectionForm } from "@/components/add-section-form";

type CreateSectionPanelProps = {
  usedColorIds: string[];
  onClose: () => void;
  onCreated?: () => void;
};

export function CreateSectionPanel({
  usedColorIds,
  onClose,
  onCreated,
}: CreateSectionPanelProps) {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderPlus className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-base font-semibold tracking-tight">New section</h2>
              <p className="text-sm text-muted-foreground">
                Pick a color not already used
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <AddSectionForm
          usedColorIds={usedColorIds}
          autoFocus
          onCancel={onClose}
          onCreated={() => {
            onCreated?.();
            onClose();
          }}
        />
      </div>
    </div>
  );
}
