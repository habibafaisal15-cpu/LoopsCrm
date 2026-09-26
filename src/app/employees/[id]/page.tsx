"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { EMPLOYEE_ROLES, type EmployeeRole } from "@/data/types";
import { useCrm } from "@/context/CrmContext";
import { Avatar, Button, Card, PageHeader, RoleBadge, StatusBadge, TypePill } from "@/components/ui";
import { formatCurrency, formatDate, formatDateTime, inWorkRange, relativeTime } from "@/lib/utils";
import { DEV_WORK_KINDS } from "@/data/types";

export default function EmployeeProfilePage() {
  const params = useParams<{ id: string }>();
  const {
    employeeById,
    companyById,
    workFor,
    isAdmin,
    canSeeAllWork,
    currentEmployee,
    updateEmployee,
  } = useCrm();
  const employee = employeeById(params.id);
  const [role, setRole] = useState<EmployeeRole | undefined>(employee?.role);
  const canViewWork = Boolean(employee && (canSeeAllWork || currentEmployee.id === employee.id));

  const work = useMemo(
    () =>
      employee
        ? workFor(employee.id)
        : {
            contacts: [],
            deals: [],
            tasks: [],
            threads: [],
            activities: [],
            coldCalls: [],
            leads: [],
            followUps: [],
            workLogs: [],
          },
    [employee, workFor],
  );

  if (!employee) {
    return (
      <PageHeader
        title="Employee not found"
        subtitle="This profile is missing or was removed."
        action={
          <Link href="/employees" className="btn outline">
            Back to team
          </Link>
        }
      />
    );
  }

  const wonDeals = work.deals.filter((deal) => deal.stage === "won");
  const wonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
  const openTasks = work.tasks.filter((task) => !task.done);

  return (
    <>
      <PageHeader
        title="Employee profile"
        subtitle="A separate record of this person's details and the work they have done."
        action={
          <div className="toolbar">
            <Link href="/employees" className="btn outline">
              All employees
            </Link>
            {currentEmployee.id !== employee.id ? (
              <span className="chip">Sign in as {employee.email} to work as this person</span>
            ) : null}
          </div>
        }
      />

      <Card className="profile-hero">
        <Avatar name={employee.name} size="lg" />
        <div className="copy">
          <div className="profile-name">
            <h2>{employee.name}</h2>
            <RoleBadge role={employee.role} />
            <span className={`chip ${employee.status === "inactive" ? "" : ""}`}>
              {employee.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>
          <p>
            {employee.title} · {employee.department}
          </p>
          <p>{employee.bio}</p>
          <div className="company-meta">
            <span className="chip">{employee.email}</span>
            <span className="chip">{employee.phone}</span>
            <span className="chip">Joined {formatDate(employee.joinedAt)}</span>
          </div>
        </div>
        {isAdmin ? (
          <div className="profile-admin">
            <label className="field">
              <span>Role</span>
              <select
                value={role ?? employee.role}
                onChange={(event) => {
                  const next = event.target.value as EmployeeRole;
                  setRole(next);
                  void updateEmployee(employee.id, { role: next });
                }}
              >
                {EMPLOYEE_ROLES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant="outline"
              onClick={() =>
                void updateEmployee(employee.id, {
                  status: employee.status === "active" ? "inactive" : "active",
                })
              }
            >
              {employee.status === "active" ? "Mark inactive" : "Reactivate"}
            </Button>
          </div>
        ) : null}
      </Card>

      {canViewWork ? (
      <>
      {employee.role === "sales" || employee.role === "developer" ? (
      <div className="kpi-row">
        {employee.role === "sales" ? (
          <>
            <Card className="kpi">
              <div className="label">Calls today</div>
              <div className="value">{work.coldCalls.filter((call) => inWorkRange(call.calledAt, "today")).length}</div>
              <div className="trend">{work.coldCalls.length} total</div>
            </Card>
            <Card className="kpi">
              <div className="label">Leads generated</div>
              <div className="value">{work.leads.filter((lead) => inWorkRange(lead.createdAt, "today")).length}</div>
              <div className="trend">{work.leads.length} total</div>
            </Card>
            <Card className="kpi">
              <div className="label">Clients closed</div>
              <div className="value">
                {work.leads.filter((lead) => lead.status === "client" && lead.closedAt && inWorkRange(lead.closedAt, "today")).length}
              </div>
              <div className="trend">{work.leads.filter((lead) => lead.status === "client").length} total clients</div>
            </Card>
            <Card className="kpi">
              <div className="label">Open follow-ups</div>
              <div className="value">{work.followUps.filter((item) => item.outcome === "pending").length}</div>
            </Card>
          </>
        ) : (
          <>
            <Card className="kpi">
              <div className="label">Work today</div>
              <div className="value">{work.workLogs.filter((item) => inWorkRange(item.workedAt, "today")).length}</div>
            </Card>
            {DEV_WORK_KINDS.slice(0, 3).map((kind) => (
              <Card className="kpi" key={kind.id}>
                <div className="label">{kind.label}s</div>
                <div className="value">{work.workLogs.filter((item) => item.kind === kind.id).length}</div>
              </Card>
            ))}
          </>
        )}
      </div>
      ) : null}

      {employee.role === "developer" ? (
      <Card>
        <div className="card-head">
          <h2>Daily work</h2>
        </div>
        <div className="list">
          {work.workLogs.length ? (
            work.workLogs
              .slice()
              .sort((a, b) => +new Date(b.workedAt) - +new Date(a.workedAt))
              .map((item) => (
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
            <p className="empty-note">No build work logged on this profile yet.</p>
          )}
        </div>
      </Card>
      ) : null}

      <div className="kpi-row">
        <Card className="kpi">
          <div className="label">Contacts owned</div>
          <div className="value">{work.contacts.length}</div>
        </Card>
        <Card className="kpi">
          <div className="label">Deals owned</div>
          <div className="value">{work.deals.length}</div>
        </Card>
        <Card className="kpi">
          <div className="label">Won</div>
          <div className="value">{formatCurrency(wonValue)}</div>
          <div className="trend">{wonDeals.length} closed-won</div>
        </Card>
        <Card className="kpi">
          <div className="label">Open tasks</div>
          <div className="value">{openTasks.length}</div>
        </Card>
      </div>

      <div className="settings-grid">
        <Card>
          <div className="card-head">
            <h2>Deals</h2>
          </div>
          <div className="list">
            {work.deals.length ? (
              work.deals.map((deal) => (
                <div className="list-row" key={deal.id}>
                  <div className="copy">
                    <strong>{deal.title}</strong>
                    <span>
                      {companyById(deal.companyId)?.name} · {formatCurrency(deal.value)}
                    </span>
                  </div>
                  <StatusBadge stage={deal.stage} />
                </div>
              ))
            ) : (
              <p className="empty-note">No deals on this profile yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="card-head">
            <h2>Tasks</h2>
          </div>
          <div className="list">
            {work.tasks.length ? (
              work.tasks.map((task) => (
                <div className="list-row" key={task.id}>
                  <div className="copy">
                    <strong style={{ textDecoration: task.done ? "line-through" : "none" }}>
                      {task.title}
                    </strong>
                    <span>{formatDateTime(task.dueAt)}</span>
                  </div>
                  <TypePill type={task.type} />
                </div>
              ))
            ) : (
              <p className="empty-note">No tasks on this profile yet.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="settings-grid">
        <Card>
          <div className="card-head">
            <h2>Contacts</h2>
          </div>
          <div className="list">
            {work.contacts.length ? (
              work.contacts.map((contact) => (
                <div className="list-row" key={contact.id}>
                  <Avatar name={contact.name} size="sm" />
                  <div className="copy">
                    <strong>{contact.name}</strong>
                    <span>
                      {companyById(contact.companyId)?.name} · {contact.email}
                    </span>
                  </div>
                  <StatusBadge stage={contact.status} />
                </div>
              ))
            ) : (
              <p className="empty-note">No contacts on this profile yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="card-head">
            <h2>Work history</h2>
          </div>
          <div className="list">
            {work.activities.length ? (
              work.activities.map((item) => (
                <div className="list-row" key={item.id}>
                  <div className="copy">
                    <strong>{item.text}</strong>
                    <span>
                      {item.detail ? `${item.detail} · ` : ""}
                      {relativeTime(item.time)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-note">No logged work yet.</p>
            )}
          </div>
        </Card>
      </div>
      </>
      ) : (
        <Card>
          <p className="empty-note">
            Only admins and managers can open another employee&apos;s work history. Switch to an admin
            account from the top-right menu to review this profile.
          </p>
        </Card>
      )}
    </>
  );
}
