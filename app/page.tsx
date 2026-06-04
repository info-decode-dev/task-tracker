import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { AddSectionForm } from "@/components/add-section-form";
import { SectionCard } from "@/components/section-card";
import type { SectionWithTasks } from "@/lib/types";
import { hasEnvVars } from "@/lib/utils";

export default async function HomePage() {
  if (!hasEnvVars) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-6 md:p-10">
        <h1 className="text-3xl font-bold tracking-tight">Task Tracker</h1>
        <p className="text-muted-foreground">
          Copy <code className="rounded bg-muted px-1">.env.example</code> to{" "}
          <code className="rounded bg-muted px-1">.env.local</code> and add your
          Supabase project URL and publishable key, then run the SQL migration
          in <code className="rounded bg-muted px-1">supabase/migrations/001_sections_tasks.sql</code>.
        </p>
      </main>
    );
  }

  const supabase = await createClient();

  const { data: sections, error } = await supabase
    .from("sections")
    .select("*, tasks(*)")
    .order("position", { ascending: true })
    .order("position", { ascending: true, referencedTable: "tasks" });

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6 md:p-10">
        <p className="text-destructive">
          Failed to load sections. Make sure you have run the database migration
          in Supabase.
        </p>
      </main>
    );
  }

  const sortedSections = (sections ?? []) as SectionWithTasks[];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-6 md:p-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Tracker</h1>
          <p className="text-muted-foreground">
            Organize tasks by section and track completion.
          </p>
        </div>
        <LogoutButton />
      </header>

      <AddSectionForm />

      {sortedSections.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-muted-foreground">
            No sections yet. Create your first section above.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {sortedSections.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      )}
    </main>
  );
}
