"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DEV_WORK_KINDS, type DevWorkKind } from "@/data/types";
import { useCrm } from "@/context/CrmContext";
import { Button, Card, Field, Modal, PageHeader } from "@/components/ui";
import { formatDateTime, inWorkRange } from "@/lib/utils";

export default function DailyWorkPage() {
  const { workLogs, logWork, currentEmployee, canSeeAllWork, employeeById, isDeveloper } = useCrm();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    kind: "website" as DevWorkKind,
    title: "",
    details: "",
    workedAt: "",
  });

  const rows = useMemo(
    () => [...workLogs].sort((a, b) => +new Date(b.workedAt) - +new Date(a.workedAt)),
    [workLogs],
  );
  const today = rows.filter((item) => inWorkRange(item.workedAt, "today"));
  const canLog = isDeveloper || currentEmployee.role === "admin";

  return (
    <>
      <PageHeader
        title="Daily work"
        subtitle={
          canSeeAllWork
            ? "Websites, POS builds, discussions, ideas and extra work from the developers."
            : "Log what you built or discussed today — websites, POS, ideas and extra work."
        }
        action={
          canLog ? (
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} />
              Add today's work
            </Button>
          ) : null
        }
      />

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
          <h2>Work log</h2>
        </div>
        <div className="list">
          {rows.length ? (
            rows.map((item) => (
              <div className="list-row" key={item.id}>
                <div className="copy">
                  <strong>{item.title}</strong>
                  <span>
                    {canSeeAllWork ? `${employeeById(item.ownerId)?.name ?? "Developer"} · ` : ""}
                    {formatDateTime(item.workedAt)}
                  </span>
                  <span>{item.details}</span>
                </div>
                <span className={`lead-badge ${item.kind}`}>
                  {DEV_WORK_KINDS.find((kind) => kind.id === item.kind)?.label}
                </span>
              </div>
            ))
          ) : (
            <p className="empty-note">No work logged yet. Add a website, POS, discussion, idea or extra task.</p>
          )}
        </div>
      </Card>

      <Modal open={open} title="Log today's work" onClose={() => setOpen(false)}>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            await logWork({
              ...form,
              workedAt: form.workedAt ? new Date(form.workedAt).toISOString() : undefined,
            });
            setOpen(false);
            setForm({ kind: "website", title: "", details: "", workedAt: "" });
          }}
        >
          <Field label="Type">
            <select
              value={form.kind}
              onChange={(event) => setForm({ ...form, kind: event.target.value as DevWorkKind })}
            >
              {DEV_WORK_KINDS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="What did you work on?">
            <input
              required
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Client website, POS, discussion topic..."
            />
          </Field>
          <Field label="Details">
            <input
              value={form.details}
              onChange={(event) => setForm({ ...form, details: event.target.value })}
              placeholder="What was done, decided or suggested"
            />
          </Field>
          <Field label="When (optional)">
            <input
              type="datetime-local"
              value={form.workedAt}
              onChange={(event) => setForm({ ...form, workedAt: event.target.value })}
            />
          </Field>
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save work</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
