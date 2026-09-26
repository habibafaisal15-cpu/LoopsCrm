"use client";

import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Clock3,
  Code2,
  Handshake,
  Mail,
  MessageSquare,
  Phone,
  Users,
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { Avatar, Card, StatusBadge, TypePill } from "@/components/ui";
import { PIPELINE_STAGES } from "@/data/types";
import { formatDateTime, relativeTime } from "@/lib/utils";

const kpiIcons = {
  contacts: Users,
  companies: Building2,
  deals: Clock3,
  tasks: Clock3,
};

export function KpiCards() {
  const { visibleTasks, coldCalls, leads, followUps } = useCrm();
  const due = visibleTasks.filter((task) => !task.done);
  const callsToday = coldCalls.filter((call) => new Date(call.calledAt).toDateString() === new Date().toDateString()).length;
  const openFollowUps = followUps.filter((item) => item.outcome === "pending").length;
  const openLeads = leads.filter((lead) => lead.status === "open" || lead.status === "following").length;
  const clients = leads.filter((lead) => lead.status === "client").length;
  const dueToday = due.filter((task) => {
    const date = new Date(task.dueAt);
    const now = new Date();
    return date.toDateString() === now.toDateString();
  }).length;

  const items = [
    { key: "calls", label: "Calls today", value: callsToday, icon: kpiIcons.contacts, tone: "blue", trend: `${coldCalls.length} logged in total` },
    { key: "leads", label: "Active leads", value: openLeads, icon: kpiIcons.companies, tone: "purple", trend: `${clients} closed clients` },
    { key: "follow", label: "Follow-ups open", value: openFollowUps, icon: Handshake, tone: "gold", trend: `${leads.filter((lead) => lead.status === "wasted").length} wasted` },
    { key: "tasks", label: "Tasks Due", value: due.length, icon: kpiIcons.tasks, tone: "peach", trend: `${dueToday} today`, muted: true },
  ];

  return (
    <div className="kpi-row">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.key} className="kpi">
            <div className={`kpi-icon ${item.tone}`}>
              <Icon size={16} />
            </div>
            <div className="label">{item.label}</div>
            <div className="value">{item.value}</div>
            <div className={`trend ${item.muted ? "neutral" : ""}`}>{item.trend}</div>
          </Card>
        );
      })}
    </div>
  );
}

export function SalesPipeline() {
  const { visibleDeals } = useCrm();
  const counts = PIPELINE_STAGES.map((stage, index) => ({
    ...stage,
    count: visibleDeals.filter((deal) => deal.stage === stage.id).length,
    band: `s${index + 1}`,
  }));

  return (
    <Card>
      <div className="card-head">
        <h2>Sales Pipeline</h2>
        <select defaultValue="month" aria-label="Pipeline period">
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>
      </div>
      <div className="pipeline-wrap">
        <div className="funnel">
          {counts.map((stage) => (
            <div key={stage.id} className={`funnel-band ${stage.band}`} />
          ))}
        </div>
        <ul className="pipeline-legend">
          {counts.map((stage) => (
            <li key={stage.id}>
              <span>{stage.label}</span>
              <strong>{stage.count}</strong>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export function DealsOverview() {
  const { visibleDeals } = useCrm();
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthDeals = visibleDeals.filter((deal) => {
    const date = new Date(deal.closeDate);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });
  const points = Array.from({ length: lastDay }, (_, index) =>
    monthDeals.filter((deal) => new Date(deal.closeDate).getDate() === index + 1).length,
  );
  const width = 560;
  const height = 220;
  const pad = { top: 16, right: 12, bottom: 28, left: 28 };
  const max = Math.max(4, ...points);
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const coords = points.map((value, index) => {
    const x = pad.left + (index / Math.max(points.length - 1, 1)) * innerW;
    const y = pad.top + (1 - value / max) * innerH;
    return `${x},${y}`;
  });
  const month = now.toLocaleString("en-US", { month: "short" });
  const labels = [1, 7, 14, 21, lastDay].map((day) => `${month} ${day}`);
  const ticks = [0, Math.round(max / 2), max];

  return (
    <Card>
      <div className="card-head">
        <h2>Deals this month</h2>
      </div>
      {monthDeals.length ? (
        <div className="chart-wrap">
          <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Deals this month">
            {ticks.map((tick) => {
              const y = pad.top + (1 - tick / max) * innerH;
              return (
                <g key={tick}>
                  <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="var(--line)" />
                  <text x={0} y={y + 4} fill="var(--muted)" fontSize="11">
                    {tick}
                  </text>
                </g>
              );
            })}
            <polyline
              fill="none"
              stroke="var(--brand)"
              strokeWidth="2.4"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={coords.join(" ")}
            />
            {labels.map((label, index) => {
              const x = pad.left + (index / (labels.length - 1)) * innerW;
              return (
                <text key={label} x={x} y={height - 6} textAnchor="middle" fill="var(--muted)" fontSize="11">
                  {label}
                </text>
              );
            })}
          </svg>
        </div>
      ) : (
        <p className="empty-note">No deals this month yet. New deals will show here as they are added.</p>
      )}
    </Card>
  );
}

export function UpcomingTasks() {
  const { visibleTasks, toggleTask } = useCrm();
  const upcoming = [...visibleTasks]
    .filter((task) => !task.done)
    .sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt))
    .slice(0, 5);

  return (
    <Card>
      <div className="card-head">
        <h2>Upcoming Tasks</h2>
        <Link href="/tasks" className="muted-link">
          View all
        </Link>
      </div>
      <div className="list">
        {upcoming.length ? (
          upcoming.map((task) => (
            <div className="list-row" key={task.id}>
              <button
                className={`task-check ${task.done ? "done" : ""}`}
                onClick={() => toggleTask(task.id)}
                aria-label={`Complete ${task.title}`}
              />
              <div className="copy">
                <strong>{task.title}</strong>
                <span>{formatDateTime(task.dueAt)}</span>
              </div>
              <TypePill type={task.type} />
            </div>
          ))
        ) : (
          <p className="empty-note">No open tasks yet.</p>
        )}
      </div>
    </Card>
  );
}

export function RecentContacts() {
  const { visibleContacts, companyById, employeeById } = useCrm();
  const rows = visibleContacts.slice(0, 5);

  return (
    <Card>
      <div className="card-head">
        <h2>Recent Contacts</h2>
        <Link href="/contacts" className="muted-link">
          View all
        </Link>
      </div>
      <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Owner</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((contact) => (
              <tr key={contact.id}>
                <td>
                  <div className="person">
                    <Avatar name={contact.name} size="sm" />
                    {contact.name}
                  </div>
                </td>
                <td>{companyById(contact.companyId)?.name}</td>
                <td>{contact.email}</td>
                <td>{contact.phone}</td>
                <td>{employeeById(contact.ownerId)?.name}</td>
                <td>
                  <StatusBadge stage={contact.status} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>
                <p className="empty-note">No contacts yet. Add one to get started.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </Card>
  );
}

const activityIcon = {
  call: Phone,
  email: Mail,
  meeting: CalendarDays,
  deal: Handshake,
  message: MessageSquare,
  work: Code2,
};

export function RecentActivity() {
  const { visibleActivities } = useCrm();

  return (
    <Card>
      <div className="card-head">
        <h2>Recent Activity</h2>
        <Link href="/reports" className="muted-link">
          View all
        </Link>
      </div>
      <div className="list">
        {visibleActivities.length ? (
          visibleActivities.slice(0, 5).map((item) => {
            const Icon = activityIcon[item.type];
            return (
              <div className="list-row" key={item.id}>
                <div className={`activity-icon ${item.type}`}>
                  <Icon size={14} />
                </div>
                <div className="copy">
                  <strong>{item.text}</strong>
                  <span className="activity-time">
                    {item.detail ? `${item.detail} · ` : ""}
                    {relativeTime(item.time)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="empty-note">No activity yet. It appears as the team logs work.</p>
        )}
      </div>
    </Card>
  );
}
