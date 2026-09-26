"use client";

import Link from "next/link";
import { useCrm } from "@/context/CrmContext";
import { Card, PageHeader, RoleBadge } from "@/components/ui";
import { PIPELINE_STAGES } from "@/data/types";
import { formatCurrency, inWorkRange } from "@/lib/utils";

export default function ReportsPage() {
  const { visibleDeals, visibleContacts, visibleTasks, visibleActivities, employees, workFor, isAdmin } =
    useCrm();
  const won = visibleDeals.filter((deal) => deal.stage === "won");
  const pipelineValue = visibleDeals.reduce((sum, deal) => sum + deal.value, 0);
  const wonValue = won.reduce((sum, deal) => sum + deal.value, 0);
  const winRate = visibleDeals.length ? Math.round((won.length / visibleDeals.length) * 100) : 0;
  const openTasks = visibleTasks.filter((task) => !task.done).length;

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Work counts by person. Lead names and phone numbers are not shown to managers."
      />

      <div className="kpi-row">
        <Card className="kpi">
          <div className="label">Pipeline value</div>
          <div className="value">{formatCurrency(pipelineValue)}</div>
          <div className="trend">{visibleDeals.length} open and won deals</div>
        </Card>
        <Card className="kpi">
          <div className="label">Won</div>
          <div className="value">{formatCurrency(wonValue)}</div>
          <div className="trend">{won.length} closed-won deals</div>
        </Card>
        <Card className="kpi">
          <div className="label">Win rate</div>
          <div className="value">{winRate}%</div>
          <div className="trend">{visibleContacts.length} contacts in motion</div>
        </Card>
        <Card className="kpi">
          <div className="label">Open tasks</div>
          <div className="value">{openTasks}</div>
          <div className="trend">{visibleActivities.length} logged activities</div>
        </Card>
      </div>

      <div className="settings-grid">
        <Card>
          <div className="card-head">
            <h2>Value by stage</h2>
          </div>
          <ul className="pipeline-legend">
            {PIPELINE_STAGES.map((stage) => {
              const column = visibleDeals.filter((deal) => deal.stage === stage.id);
              const value = column.reduce((sum, deal) => sum + deal.value, 0);
              return (
                <li key={stage.id}>
                  <span>
                    {stage.label} · {column.length}
                  </span>
                  <strong>{formatCurrency(value)}</strong>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card>
          <div className="card-head">
            <h2>Work by employee</h2>
          </div>
          <div className="list">
            {employees
              .filter((employee) => isAdmin || employee.status === "active")
              .map((employee) => {
                const work = workFor(employee.id);
                const employeeWon = work.deals
                  .filter((deal) => deal.stage === "won")
                  .reduce((sum, deal) => sum + deal.value, 0);
                return (
                  <Link key={employee.id} href={`/employees/${employee.id}`} className="list-row">
                    <div className="copy">
                      <strong>{employee.name}</strong>
                      <span>
                        {employee.role === "sales"
                          ? `${work.coldCalls.filter((call) => inWorkRange(call.calledAt, "today")).length} calls today · ${work.leads.filter((lead) => inWorkRange(lead.createdAt, "today")).length} leads · ${work.leads.filter((l) => l.status === "client").length} clients`
                          : employee.role === "developer"
                            ? `${work.workLogs.filter((item) => inWorkRange(item.workedAt, "today")).length} work today · ${work.workLogs.length} total`
                            : `${work.deals.length} deals · ${work.contacts.length} contacts · ${formatCurrency(employeeWon)} won`}
                      </span>
                    </div>
                    <RoleBadge role={employee.role} />
                  </Link>
                );
              })}
          </div>
        </Card>
      </div>
    </>
  );
}
