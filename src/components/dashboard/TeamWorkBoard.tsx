"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DEV_WORK_KINDS, type Employee } from "@/data/types";
import { useCrm } from "@/context/CrmContext";
import { Card } from "@/components/ui";
import { formatDateTime, inWorkRange, type WorkRange } from "@/lib/utils";

function bdStats(employee: Employee, range: WorkRange, crm: ReturnType<typeof useCrm>) {
  const work = crm.workFor(employee.id);
  const calls = work.coldCalls.filter((call) => inWorkRange(call.calledAt, range)).length;
  const leads = work.leads.filter((lead) => inWorkRange(lead.createdAt, range)).length;
  const followUps = work.followUps.filter((item) => inWorkRange(item.createdAt, range)).length;
  const clients = work.leads.filter(
    (lead) => lead.status === "client" && lead.closedAt && inWorkRange(lead.closedAt, range),
  ).length;
  return { calls, leads, followUps, clients };
}

export function TeamWorkBoard({ compact = false }: { compact?: boolean }) {
  const crm = useCrm();
  const { employees, workLogs, employeeById } = crm;
  const [range, setRange] = useState<WorkRange>("today");

  const bds = useMemo(
    () => employees.filter((employee) => employee.role === "sales" && employee.status === "active"),
    [employees],
  );
  const developers = useMemo(
    () => employees.filter((employee) => employee.role === "developer" && employee.status === "active"),
    [employees],
  );
  const logs = useMemo(
    () =>
      [...workLogs]
        .filter((item) => inWorkRange(item.workedAt, range))
        .sort((a, b) => +new Date(b.workedAt) - +new Date(a.workedAt)),
    [workLogs, range],
  );

  const totals = bds.reduce(
    (sum, employee) => {
      const row = bdStats(employee, range, crm);
      return {
        calls: sum.calls + row.calls,
        leads: sum.leads + row.leads,
        followUps: sum.followUps + row.followUps,
        clients: sum.clients + row.clients,
      };
    },
    { calls: 0, leads: 0, followUps: 0, clients: 0 },
  );

  const rangeLabel = range === "today" ? "today" : range === "week" ? "this week" : "all time";

  return (
    <div className="stack">
      <div className="toolbar">
        {(["today", "week", "all"] as const).map((item) => (
          <button
            key={item}
            className={`btn ${range === item ? "primary" : "outline"}`}
            onClick={() => setRange(item)}
          >
            {item === "today" ? "Today" : item === "week" ? "This week" : "All time"}
          </button>
        ))}
      </div>

      <div className="kpi-row">
        <Card className="kpi">
          <div className="label">BD calls {rangeLabel}</div>
          <div className="value">{totals.calls}</div>
        </Card>
        <Card className="kpi">
          <div className="label">Leads generated</div>
          <div className="value">{totals.leads}</div>
        </Card>
        <Card className="kpi">
          <div className="label">Follow-ups taken</div>
          <div className="value">{totals.followUps}</div>
        </Card>
        <Card className="kpi">
          <div className="label">Clients closed</div>
          <div className="value">{totals.clients}</div>
        </Card>
        <Card className="kpi">
          <div className="label">Developer logs</div>
          <div className="value">{logs.length}</div>
        </Card>
      </div>

      <div className="settings-grid">
        <Card>
          <div className="card-head">
            <h2>Business developers</h2>
            {compact ? (
              <Link href="/team-work" className="muted-link">
                Full board
              </Link>
            ) : null}
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Calls</th>
                  <th>Leads</th>
                  <th>Follow-ups</th>
                  <th>Clients</th>
                </tr>
              </thead>
              <tbody>
                {bds.map((employee) => {
                  const row = bdStats(employee, range, crm);
                  return (
                    <tr key={employee.id}>
                      <td>
                        <Link href={`/employees/${employee.id}`}>
                          <strong>{employee.name}</strong>
                        </Link>
                      </td>
                      <td>{row.calls}</td>
                      <td>{row.leads}</td>
                      <td>{row.followUps}</td>
                      <td>{row.clients}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="card-head">
            <h2>Developers</h2>
            {compact ? (
              <Link href="/work" className="muted-link">
                All logs
              </Link>
            ) : null}
          </div>
          <div className="list">
            {developers.map((employee) => {
              const count = logs.filter((item) => item.ownerId === employee.id).length;
              return (
                <Link key={employee.id} href={`/employees/${employee.id}`} className="list-row">
                  <div className="copy">
                    <strong>{employee.name}</strong>
                    <span>
                      {count} work {count === 1 ? "entry" : "entries"} {rangeLabel}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>

      {!compact ? (
        <Card>
          <div className="card-head">
            <h2>Developer work {rangeLabel}</h2>
          </div>
          <div className="list">
            {logs.length ? (
              logs.map((item) => (
                <div className="list-row" key={item.id}>
                  <div className="copy">
                    <strong>{item.title}</strong>
                    <span>
                      {employeeById(item.ownerId)?.name ?? "Developer"} · {formatDateTime(item.workedAt)}
                    </span>
                    <span>{item.details}</span>
                  </div>
                  <span className={`lead-badge ${item.kind}`}>
                    {DEV_WORK_KINDS.find((kind) => kind.id === item.kind)?.label}
                  </span>
                </div>
              ))
            ) : (
              <p className="empty-note">No developer work logged in this period.</p>
            )}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
