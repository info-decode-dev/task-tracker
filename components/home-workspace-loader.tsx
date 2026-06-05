"use client";

import { useSearchParams } from "next/navigation";
import { HomeWorkspace } from "@/components/home-workspace";
import type { HomeWorkspaceProps } from "@/components/home-workspace";

type HomeWorkspaceLoaderProps = Omit<HomeWorkspaceProps, "initialSectionId">;

export function HomeWorkspaceLoader(props: HomeWorkspaceLoaderProps) {
  const searchParams = useSearchParams();
  const initialSectionId = searchParams.get("section");

  return <HomeWorkspace {...props} initialSectionId={initialSectionId} />;
}
