"use client";

import { useCrm } from "@/context/CrmContext";
import {
  DealsOverview,
  KpiCards,
  RecentActivity,
  RecentContacts,
  SalesPipeline,
  UpcomingTasks,
} from "@/components/dashboard/DashboardWidgets";
import { TeamWorkBoard } from "@/components/dashboard/TeamWorkBoard";
import { greetingFor, inWorkRange, longDate } from "@/lib/utils";
import { Card } from "@/components/ui";
import Link from "next/link";
import { DEV_WORK_KINDS } from "@/data/types";
import { formatDateTime } from "@/lib/utils";

export default function DashboardPage() {
  const { profile, canSeeAllWork, canSeeLeadDetails, isDeveloper, workLogs } = useCrm();
  const today = workLogs.filter((item) => inWorkRange(item.workedAt, "today"));

  return (
    <>
      <div className="hero">
        <div>
          <h1>
            {greetingFor()}, {profile.greetingName} ✨
          </h1>
          <p>
            {canSeeAllWork && !canSeeLeadDetails
              ? "Team scoreboard only — who made how many calls, leads and follow-ups. No names or numbers."
              : canSeeAllWork
                ? "Team daily work plus every lead and phone number."
                : isDeveloper
                  ? "Log today's websites, POS builds, discussions, ideas and extra work."
                  : "Your daily calls, leads and follow-up reminders."}
          </p>
        </div>
        <time dateTime={new Date().toISOString()}>{longDate()}</time>
      </div>

      {canSeeAllWork ? <TeamWorkBoard compact /> : null}

      {isDeveloper ? (
        <div className="stack" style={{ marginTop: canSeeAllWork ? 24 : 0 }}>
          <div className="kpi-row">
            <Card className="kpi">
              <div className="label">Logged today</div>
              <div className="value">{today.length}</div>
            </Card>
            {DEV_WORK_KINDS.slice(0, 3).map((kind) => (
              <Card className="kpi" key={kind.id}>
                <div className="label">{kind.label}s today</div>
                <div className="value">{today.filter((item) => item.kind === kind.id).length}</div>
              </Card>
            ))}
          </div>
          <Card>
            <div className="card-head">
              <h2>Today's work</h2>
              <Link href="/work" className="muted-link">
                Add / view all
              </Link>
            </div>
            <div className="list">
              {today.length ? (
                today.map((item) => (
                  <div className="list-row" key={item.id}>
                    <div className="copy">
                      <strong>{item.title}</strong>
                      <span>{formatDateTime(item.workedAt)}</span>
                      <span>{item.details}</span>
                    </div>
                    <span className={`lead-badge ${item.kind}`}>
                      {DEV_WORK_KINDS.find((kind) => kind.id === item.kind)?.label}
                    </span>
                  </div>
                ))
              ) : (
                <p className="empty-note">Nothing logged today yet. Add a website, POS, discussion or idea.</p>
              )}
            </div>
          </Card>
        </div>
      ) : null}

      {!isDeveloper && canSeeLeadDetails ? (
        <div className="dash-grid" style={{ marginTop: canSeeAllWork ? 24 : 0 }}>
          <div className="stack">
            <KpiCards />
            <div className="kpi-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <SalesPipeline />
              <DealsOverview />
            </div>
            <RecentContacts />
          </div>
          <div className="stack">
            <UpcomingTasks />
            <RecentActivity />
          </div>
        </div>
      ) : null}
    </>
  );
}
