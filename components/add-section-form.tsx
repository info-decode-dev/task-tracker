"use client";

import { useState, useTransition } from "react";
import { createSection } from "@/app/actions/tracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddSectionForm() {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await createSection(title);
        setTitle("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create section");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <Input
        placeholder="New section name..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isPending}
        className="sm:max-w-xs"
      />
      <Button type="submit" disabled={isPending || !title.trim()}>
        {isPending ? "Adding..." : "Add Section"}
      </Button>
      {error && <p className="text-sm text-destructive sm:basis-full">{error}</p>}
    </form>
  );
}
