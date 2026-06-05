"use client";

import { Suspense } from "react";
import { TimelineView } from "@/components/timeline-view";
import type { TimelineItem, TimelineMember } from "@/lib/types";

type TimelineViewLoaderProps = {
  members: TimelineMember[];
  items: TimelineItem[];
  currentUserId: string;
  isAdmin: boolean;
};

function TimelineViewInner(props: TimelineViewLoaderProps) {
  return <TimelineView {...props} />;
}

export function TimelineViewLoader(props: TimelineViewLoaderProps) {
  return (
    <Suspense fallback={<div className="py-8 text-sm text-muted-foreground">Loading...</div>}>
      <TimelineViewInner {...props} />
    </Suspense>
  );
}
