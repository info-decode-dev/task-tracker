type ComingSoonPanelProps = {
  title: string;
  description: string;
};

export function ComingSoonPanel({ title, description }: ComingSoonPanelProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card/80 px-6 py-8 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Coming soon
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
