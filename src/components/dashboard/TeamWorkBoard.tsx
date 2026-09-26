"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DEV_WORK_KINDS, type Employee } from "@/data/types";
import { useCrm } from "@/context/CrmContext";
import { Card } from "@/components/ui";
import { formatDateTime, inWorkRange, type WorkRange } from "@/lib/utils";

function taskDoneAt(task: { done: boolean; completedAt?: string; dueAt: string }) {
  if (!task.done) return "";
  return task.completedAt || task.dueAt;
}

function bdStats(employee: Employee, range: WorkRange, crm: ReturnType<typeof useCrm>) {
  const work = crm.workFor(employee.id);
  const calls = work.coldCalls.filter((call) => inWorkRange(call.calledAt, range)).length;
  const leads = work.leads.filter((lead) => inWorkRange(lead.createdAt, range)).length;
  const followUps = work.followUps.filter((item) => inWorkRange(item.createdAt, range)).length;
  const clients = work.leads.filter(
    (lead) => lead.status === "client" && lead.closedAt && inWorkRange(lead.closedAt, range),
  ).length;
  const tasksDone = work.tasks.filter((task) => {
    const at = taskDoneAt(task);
    return Boolean(at && inWorkRange(at, range));
  }).length;
  return { calls, leads, followUps, clients, tasksDone };
}

function taskStats(employee: Employee, range: WorkRange, crm: ReturnType<typeof useCrm>) {
  const work = crm.workFor(employee.id);
  return work.tasks.filter((task) => {
    const at = taskDoneAt(task);
    return Boolean(at && inWorkRange(at, range));
  }).length;
}

export function TeamWorkBoard({ compact = false }: { compact?: boolean }) {
  const crm = useCrm();
  const { employees, workLogs, employeeById, isAdmin, tasks } = crm;
  const [range, setRange] = useState<WorkRange>("today");

  const bds = useMemo(
    () => employees.filter((employee) => employee.role === "sales" && employee.status === "active"),
    [employees],
  );
  const managers = useMemo(
    () => employees.filter((employee) => employee.role === "manager" && employee.status === "active"),
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
        tasksDone: sum.tasksDone + row.tasksDone,
      };
    },
    { calls: 0, leads: 0, followUps: 0, clients: 0, tasksDone: 0 },
  );

  const managerTasks = managers.reduce((sum, employee) => sum + taskStats(employee, range, crm), 0);
  const developerTasks = developers.reduce((sum, employee) => sum + taskStats(employee, range, crm), 0);
  const completedTasks = useMemo(
    () =>
      tasks
        .filter((task) => {
          const at = taskDoneAt(task);
          return Boolean(at && inWorkRange(at, range));
        })
        .sort((a, b) => +new Date(taskDoneAt(b)) - +new Date(taskDoneAt(a))),
    [tasks, range],
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
        <Card className="kpi">
          <div className="label">Tasks done</div>
          <div className="value">{totals.tasksDone + managerTasks + developerTasks}</div>
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
                  <th>Tasks</th>
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
                      <td>{row.tasksDone}</td>
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
            {developers.length ? (
              developers.map((employee) => {
                const count = logs.filter((item) => item.ownerId === employee.id).length;
                return (
                  <Link key={employee.id} href={`/employees/${employee.id}`} className="list-row">
                    <div className="copy">
                      <strong>{employee.name}</strong>
                      <span>
                        {count} work {count === 1 ? "entry" : "entries"} · {taskStats(employee, range, crm)}{" "}
                        tasks done {rangeLabel}
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="empty-note">No developers on the team yet.</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="card-head">
          <h2>Managers</h2>
        </div>
        <div className="list">
          {managers.length ? (
            managers.map((employee) => (
              <Link key={employee.id} href={`/employees/${employee.id}`} className="list-row">
                <div className="copy">
                  <strong>{employee.name}</strong>
                  <span>
                    {taskStats(employee, range, crm)} tasks done {rangeLabel}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="empty-note">No managers on the team yet.</p>
          )}
        </div>
      </Card>

      {!compact && isAdmin ? (
        <Card>
          <div className="card-head">
            <h2>Completed tasks {rangeLabel}</h2>
          </div>
          <div className="list">
            {completedTasks.length ? (
              completedTasks.map((task) => (
                <div className="list-row" key={task.id}>
                  <div className="copy">
                    <strong>{task.title || "Task"}</strong>
                    <span>
                      {employeeById(task.ownerId)?.name ?? "Teammate"} · {formatDateTime(taskDoneAt(task))}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-note">No tasks marked done in this period.</p>
            )}
          </div>
        </Card>
      ) : null}

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
