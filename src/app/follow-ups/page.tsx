"use client";

import { useMemo, useState } from "react";
import { useCrm } from "@/context/CrmContext";
import { Button, Card, Field, Modal, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import type { FollowUpOutcome } from "@/data/types";

export default function FollowUpsPage() {
  const { followUps, leads, completeFollowUp } = useCrm();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [form, setForm] = useState({
    result: "",
    outcome: "next" as Exclude<FollowUpOutcome, "pending">,
    nextDueAt: "",
    nextDetails: "",
  });

  const pending = useMemo(
    () =>
      followUps
        .filter((item) => item.outcome === "pending")
        .sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt)),
    [followUps],
  );
  const overdue = pending.filter((item) => +new Date(item.dueAt) < Date.now());
  const active = pending.find((item) => item.id === activeId);
  const lead = active ? leads.find((item) => item.id === active.leadId) : undefined;

  return (
    <>
      <PageHeader
        title="Follow-ups"
        subtitle="Reminders stay here until the client is closed or the lead is wasted."
      />

      <div className="kpi-row">
        <Card className="kpi">
          <div className="label">Open follow-ups</div>
          <div className="value">{pending.length}</div>
        </Card>
        <Card className="kpi">
          <div className="label">Overdue</div>
          <div className="value">{overdue.length}</div>
        </Card>
      </div>

      <Card>
        <div className="list">
          {pending.length ? (
            pending.map((item) => {
              const person = leads.find((leadItem) => leadItem.id === item.leadId);
              const late = +new Date(item.dueAt) < Date.now();
              return (
                <div className="list-row" key={item.id}>
                  <div className="copy">
                    <strong>{person?.name ?? "Lead"}</strong>
                    <span>
                      {person?.company ? `${person.company} · ` : ""}
                      {formatDateTime(item.dueAt)}
                      {late ? " · Overdue" : ""}
                    </span>
                    <span>{item.details}</span>
                  </div>
                  <Button onClick={() => setActiveId(item.id)}>Enter update</Button>
                </div>
              );
            })
          ) : (
            <p className="empty-note">No open follow-ups. Closed clients and wasted leads leave this list.</p>
          )}
        </div>
      </Card>

      <Modal open={Boolean(active)} title="Follow-up update" onClose={() => setActiveId(null)}>
        {active && lead ? (
          <form
            className="form-grid"
            onSubmit={async (event) => {
              event.preventDefault();
              await completeFollowUp(active.id, {
                ...form,
                nextDueAt: form.outcome === "next" && form.nextDueAt ? new Date(form.nextDueAt).toISOString() : undefined,
              });
              setActiveId(null);
              setForm({ result: "", outcome: "next", nextDueAt: "", nextDetails: "" });
            }}
          >
            <p className="empty-note">
              {lead.name}
              {lead.company ? ` · ${lead.company}` : ""}
            </p>
            <Field label="What happened?">
              <input
                required
                value={form.result}
                onChange={(event) => setForm({ ...form, result: event.target.value })}
              />
            </Field>
            <Field label="Next step">
              <select
                value={form.outcome}
                onChange={(event) =>
                  setForm({ ...form, outcome: event.target.value as Exclude<FollowUpOutcome, "pending"> })
                }
              >
                <option value="next">Agla follow-up lena hai — stay here</option>
                <option value="client">Client close ho gaya — move to Clients</option>
                <option value="wasted">Lead waste — remove from follow-ups</option>
              </select>
            </Field>
            {form.outcome === "next" ? (
              <>
                <Field label="Next reminder">
                  <input
                    required
                    type="datetime-local"
                    value={form.nextDueAt}
                    onChange={(event) => setForm({ ...form, nextDueAt: event.target.value })}
                  />
                </Field>
                <Field label="Next follow-up details">
                  <input
                    value={form.nextDetails}
                    onChange={(event) => setForm({ ...form, nextDetails: event.target.value })}
                  />
                </Field>
              </>
            ) : null}
            <div className="modal-actions">
              <Button variant="ghost" onClick={() => setActiveId(null)}>
                Cancel
              </Button>
              <Button type="submit">Save update</Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
