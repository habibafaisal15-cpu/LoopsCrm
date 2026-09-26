"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { TASK_TYPES, useCrm } from "@/context/CrmContext";
import type { TaskType } from "@/data/types";
import { Button, Card, Field, Modal, PageHeader, TypePill } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export default function TasksPage() {
  const {
    visibleTasks,
    companies,
    employees,
    addTask,
    toggleTask,
    companyById,
    employeeById,
    currentEmployee,
    canAssignWork,
  } = useCrm();
  const [open, setOpen] = useState(false);
  const [hideDone, setHideDone] = useState(false);
  const [form, setForm] = useState({
    title: "",
    dueAt: new Date().toISOString().slice(0, 16),
    type: "task" as TaskType,
    companyId: "",
    contactId: "",
    ownerId: currentEmployee.id,
  });

  const rows = useMemo(
    () =>
      [...visibleTasks]
        .filter((task) => (hideDone ? !task.done : true))
        .sort((a, b) => Number(a.done) - Number(b.done) || +new Date(a.dueAt) - +new Date(b.dueAt)),
    [visibleTasks, hideDone],
  );

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="Add today's work. When you mark a task done, admin can see what you finished."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} />
            Add task
          </Button>
        }
      />

      <div className="toolbar">
        <Button variant={hideDone ? "primary" : "outline"} onClick={() => setHideDone((value) => !value)}>
          {hideDone ? "Showing open tasks" : "Hide completed"}
        </Button>
      </div>

      <Card>
        <div className="list">
          {rows.length ? (
            rows.map((task) => (
            <div className="list-row" key={task.id}>
              <button
                className={`task-check ${task.done ? "done" : ""}`}
                onClick={() => toggleTask(task.id)}
                aria-label={`Toggle ${task.title}`}
              />
              <div className="copy">
                <strong style={{ textDecoration: task.done ? "line-through" : "none" }}>{task.title}</strong>
                <span>
                  {formatDateTime(task.dueAt)}
                  {task.companyId ? ` · ${companyById(task.companyId)?.name}` : ""}
                  {canAssignWork ? ` · ${employeeById(task.ownerId)?.name ?? ""}` : ""}
                  {task.done ? " · Done" : ""}
                </span>
              </div>
              <TypePill type={task.type} />
            </div>
            ))
          ) : (
            <p className="empty-note">No tasks yet. Add what you will do today, then mark it done when finished.</p>
          )}
        </div>
      </Card>

      <Modal open={open} title="Add task" onClose={() => setOpen(false)}>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            await addTask({
              title: form.title,
              type: form.type,
              companyId: form.companyId || undefined,
              contactId: form.contactId || undefined,
              ownerId: canAssignWork ? form.ownerId : currentEmployee.id,
              dueAt: new Date(form.dueAt).toISOString(),
            });
            setOpen(false);
            setForm({
              title: "",
              dueAt: new Date().toISOString().slice(0, 16),
              type: "task",
              companyId: "",
              contactId: "",
              ownerId: currentEmployee.id,
            });
          }}
        >
          <Field label="Task">
            <input
              required
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </Field>
          <Field label="Due">
            <input
              type="datetime-local"
              value={form.dueAt}
              onChange={(event) => setForm({ ...form, dueAt: event.target.value })}
            />
          </Field>
          <Field label="Type">
            <select
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value as TaskType })}
            >
              {TASK_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </Field>
          {companies.length ? (
            <Field label="Company (optional)">
              <select
                value={form.companyId}
                onChange={(event) => setForm({ ...form, companyId: event.target.value })}
              >
                <option value="">No company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
          {canAssignWork ? (
            <Field label="Assigned employee">
              <select
                value={form.ownerId}
                onChange={(event) => setForm({ ...form, ownerId: event.target.value })}
              >
                {employees
                  .filter((employee) => employee.status === "active")
                  .map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
              </select>
            </Field>
          ) : null}
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save task</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
