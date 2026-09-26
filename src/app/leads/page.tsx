"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { LEAD_STATUSES, type LeadStatus } from "@/data/types";
import { useCrm } from "@/context/CrmContext";
import { Button, Card, Field, Modal, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function LeadsPage() {
  const { leads, addLead, scheduleFollowUp, updateLeadStatus } = useCrm();
  const [filter, setFilter] = useState<"active" | LeadStatus>("active");
  const [open, setOpen] = useState(false);
  const [follow, setFollow] = useState<{ leadId: string; dueAt: string; details: string } | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    notes: "",
    followUpAt: "",
    followUpDetails: "",
  });

  const rows = useMemo(
    () =>
      leads.filter((lead) => {
        if (filter === "active") return lead.status === "open" || lead.status === "following";
        return lead.status === filter;
      }),
    [leads, filter],
  );

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle="Cold calls that turned into leads stay here until they become a client or are wasted."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} />
            Add lead
          </Button>
        }
      />

      <div className="toolbar">
        {(["active", "open", "following", "wasted"] as const).map((item) => (
          <Button key={item} variant={filter === item ? "primary" : "outline"} onClick={() => setFilter(item)}>
            {item === "active" ? "Active leads" : LEAD_STATUSES.find((status) => status.id === item)?.label}
          </Button>
        ))}
      </div>

      <Card>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <strong>{lead.name}</strong>
                    <div className="muted-kind">{lead.email}</div>
                  </td>
                  <td>{lead.company || "—"}</td>
                  <td>{lead.phone}</td>
                  <td>
                    <span className={`lead-badge ${lead.status}`}>
                      {LEAD_STATUSES.find((status) => status.id === lead.status)?.label}
                    </span>
                  </td>
                  <td>{lead.notes || "—"}</td>
                  <td>
                    {lead.status === "open" || lead.status === "following" ? (
                      <div className="toolbar">
                        <button
                          className="btn outline"
                          onClick={() => setFollow({ leadId: lead.id, dueAt: "", details: "" })}
                        >
                          Follow-up
                        </button>
                        <button className="btn ghost" onClick={() => void updateLeadStatus(lead.id, "wasted")}>
                          Waste
                        </button>
                      </div>
                    ) : (
                      <span className="muted-kind">
                        {lead.closedAt ? formatDate(lead.closedAt) : ""}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} title="Add lead" onClose={() => setOpen(false)}>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            await addLead({
              ...form,
              followUpAt: form.followUpAt ? new Date(form.followUpAt).toISOString() : undefined,
            });
            setOpen(false);
            setForm({ name: "", phone: "", email: "", company: "", notes: "", followUpAt: "", followUpDetails: "" });
          }}
        >
          <Field label="Name">
            <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label="Phone">
            <input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </Field>
          <Field label="Email">
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </Field>
          <Field label="Company">
            <input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
          </Field>
          <Field label="Notes">
            <input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </Field>
          <Field label="Follow-up reminder">
            <input
              type="datetime-local"
              value={form.followUpAt}
              onChange={(event) => setForm({ ...form, followUpAt: event.target.value })}
            />
          </Field>
          {form.followUpAt ? (
            <Field label="Follow-up details">
              <input
                value={form.followUpDetails}
                onChange={(event) => setForm({ ...form, followUpDetails: event.target.value })}
                placeholder="What to discuss or send"
              />
            </Field>
          ) : null}
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save lead</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(follow)} title="Set follow-up reminder" onClose={() => setFollow(null)}>
        {follow ? (
          <form
            className="form-grid"
            onSubmit={async (event) => {
              event.preventDefault();
              await scheduleFollowUp({
                leadId: follow.leadId,
                dueAt: new Date(follow.dueAt).toISOString(),
                details: follow.details,
              });
              setFollow(null);
            }}
          >
            <Field label="When">
              <input
                required
                type="datetime-local"
                value={follow.dueAt}
                onChange={(event) => setFollow({ ...follow, dueAt: event.target.value })}
              />
            </Field>
            <Field label="Follow-up details">
              <input
                required
                value={follow.details}
                onChange={(event) => setFollow({ ...follow, details: event.target.value })}
                placeholder="What to say or send"
              />
            </Field>
            <div className="modal-actions">
              <Button variant="ghost" onClick={() => setFollow(null)}>
                Cancel
              </Button>
              <Button type="submit">Save reminder</Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
