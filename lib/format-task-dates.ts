const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

function parseDate(iso: string): Date | null {
  const date = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatTaskDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = parseDate(iso);
  if (!date) return null;
  return dateFormatter.format(date);
}

/** Compact date for task tiles, e.g. "Jun 4" */
export function formatTaskDateShort(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = parseDate(iso);
  if (!date) return null;
  return shortDateFormatter.format(date);
}

/** Human-readable countdown until deadline */
export function getRemainingDaysLabel(
  deadline: string | null | undefined,
  completed: boolean,
): string | null {
  if (!deadline || completed) return null;

  const today = startOfDay(new Date());
  const due = parseDate(deadline);
  if (!due) return null;

  const days = Math.round(
    (startOfDay(due).getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (days < 0) {
    const overdue = Math.abs(days);
    return overdue === 1 ? "1 day overdue" : `${overdue} days overdue`;
  }
  if (days === 0) return "Due today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

export function isDeadlineToday(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  const today = startOfDay(new Date());
  const due = parseDate(deadline);
  if (!due) return false;
  return startOfDay(due).getTime() === today.getTime();
}

export function isDeadlineOverdue(
  deadline: string | null | undefined,
  completed: boolean,
): boolean {
  if (!deadline || completed) return false;
  const due = new Date(`${deadline}T23:59:59`);
  return due.getTime() < Date.now();
}
