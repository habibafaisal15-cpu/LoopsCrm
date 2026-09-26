"use client";

import { TeamWorkBoard } from "@/components/dashboard/TeamWorkBoard";
import { useCrm } from "@/context/CrmContext";
import { PageHeader } from "@/components/ui";

export default function TeamWorkPage() {
  const { canSeeAllWork } = useCrm();

  if (!canSeeAllWork) {
    return (
      <PageHeader
        title="Team work"
        subtitle="Only the admin and manager can open the team scoreboard."
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Team work"
        subtitle="Who did how much work: calls, leads, follow-ups, clients, and tasks marked done. Lead names and numbers stay hidden from managers."
      />
      <TeamWorkBoard />
    </>
  );
}
