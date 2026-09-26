"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { EMPLOYEE_ROLES, type EmployeeRole } from "@/data/types";
import { useCrm } from "@/context/CrmContext";
import { Avatar, Button, Card, Field, Modal, PageHeader, RoleBadge } from "@/components/ui";
import { formatCurrency, inWorkRange } from "@/lib/utils";

export default function EmployeesPage() {
  const { employees, workFor, addEmployee, isAdmin } = useCrm();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    greetingName: "",
    email: "",
    phone: "",
    role: "sales" as EmployeeRole,
    title: "",
    department: "Sales",
    bio: "",
    password: "loops123",
  });

  const rows = useMemo(
    () =>
      employees.filter((employee) => {
        const haystack = `${employee.name} ${employee.email} ${employee.title}`.toLowerCase();
        return (
          haystack.includes(query.toLowerCase()) && (role === "all" || employee.role === role)
        );
      }),
    [employees, query, role],
  );

  return (
    <>
      <PageHeader
        title="Team"
        subtitle="Each employee has a separate profile and a record of their own work."
        action={
          isAdmin ? (
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} />
              Add employee
            </Button>
          ) : null
        }
      />

      <div className="toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search employees"
        />
        <select value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="all">All roles</option>
          {EMPLOYEE_ROLES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="cards-grid">
        {rows.map((employee) => {
          const work = workFor(employee.id);
          const won = work.deals
            .filter((deal) => deal.stage === "won")
            .reduce((sum, deal) => sum + deal.value, 0);
          return (
            <Link key={employee.id} href={`/employees/${employee.id}`} className="employee-card">
              <Card>
                <div className="employee-card-head">
                  <Avatar name={employee.name} size="lg" />
                  <RoleBadge role={employee.role} />
                </div>
                <h3>{employee.name}</h3>
                <p>
                  {employee.title} · {employee.department}
                </p>
                <p>{employee.email}</p>
                <div className="company-meta">
                  {employee.role === "sales" ? (
                    <>
                      <span className="chip">
                        {work.coldCalls.filter((call) => inWorkRange(call.calledAt, "today")).length} calls today
                      </span>
                      <span className="chip">
                        {work.leads.filter((lead) => inWorkRange(lead.createdAt, "today")).length} leads today
                      </span>
                      <span className="chip">
                        {work.followUps.filter((item) => inWorkRange(item.createdAt, "today")).length} follow-ups today
                      </span>
                      <span className="chip">
                        {work.leads.filter((lead) => lead.status === "client").length} clients
                      </span>
                    </>
                  ) : employee.role === "developer" ? (
                    <>
                      <span className="chip">
                        {work.workLogs.filter((item) => inWorkRange(item.workedAt, "today")).length} logs today
                      </span>
                      <span className="chip">{work.workLogs.length} total work</span>
                    </>
                  ) : (
                    <>
                      <span className="chip">{work.contacts.length} contacts</span>
                      <span className="chip">{work.deals.length} deals</span>
                      <span className="chip">{work.tasks.filter((task) => !task.done).length} open tasks</span>
                      <span className="chip">{formatCurrency(won)} won</span>
                    </>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <Modal open={open} title="Add employee" onClose={() => setOpen(false)}>
        <form
          className="form-grid form-grid-2"
          onSubmit={async (event) => {
            event.preventDefault();
            await addEmployee({
              ...form,
              greetingName: form.greetingName || form.name.split(" ")[0],
            });
            setOpen(false);
            setForm({
              name: "",
              greetingName: "",
              email: "",
              phone: "",
              role: "sales",
              title: "",
              department: "Sales",
              bio: "",
              password: "loops123",
            });
          }}
        >
          <Field label="Full name">
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </Field>
          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
            />
          </Field>
          <Field label="Role">
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as EmployeeRole })}
            >
              {EMPLOYEE_ROLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Job title">
            <input
              required
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </Field>
          <Field label="Department">
            <input
              value={form.department}
              onChange={(event) => setForm({ ...form, department: event.target.value })}
            />
          </Field>
          <Field label="About">
            <input
              value={form.bio}
              onChange={(event) => setForm({ ...form, bio: event.target.value })}
              placeholder="What this person owns on the team"
            />
          </Field>
          <Field label="Temporary password">
            <input
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="loops123"
            />
          </Field>
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save employee</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
