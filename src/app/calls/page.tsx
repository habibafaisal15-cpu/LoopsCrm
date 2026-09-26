"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { CALL_RESPONSES, type CallResponse } from "@/data/types";
import { useCrm } from "@/context/CrmContext";
import { Button, Card, Field, Modal, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export default function ColdCallingPage() {
  const { coldCalls, logCall, currentEmployee } = useCrm();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    company: "",
    response: "no_answer" as CallResponse,
    notes: "",
    createLead: false,
    followUpAt: "",
    followUpDetails: "",
  });

  const mine = useMemo(
    () => [...coldCalls].sort((a, b) => +new Date(b.calledAt) - +new Date(a.calledAt)),
    [coldCalls],
  );
  const today = mine.filter((call) => new Date(call.calledAt).toDateString() === new Date().toDateString());
  const generateLead = form.response === "interested" || form.createLead;

  return (
    <>
      <PageHeader
        title="Cold calling"
        subtitle={`${currentEmployee.greetingName || "You"} log every call and response here. Interested calls become leads.`}
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} />
            Log today's call
          </Button>
        }
      />

      <div className="kpi-row">
        <Card className="kpi">
          <div className="label">Calls today</div>
          <div className="value">{today.length}</div>
        </Card>
        <Card className="kpi">
          <div className="label">Leads from calls</div>
          <div className="value">{mine.filter((call) => call.leadId).length}</div>
        </Card>
        <Card className="kpi">
          <div className="label">No answer / busy</div>
          <div className="value">{today.filter((call) => call.response === "no_answer" || call.response === "busy").length}</div>
        </Card>
      </div>

      <Card>
        <div className="card-head">
          <h2>Call log</h2>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Person</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Response</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {mine.map((call) => (
                <tr key={call.id}>
                  <td>{formatDateTime(call.calledAt)}</td>
                  <td>
                    <strong>{call.name}</strong>
                    {call.leadId ? <div className="chip" style={{ marginTop: 6 }}>Lead created</div> : null}
                  </td>
                  <td>{call.company || "—"}</td>
                  <td>{call.phone}</td>
                  <td>
                    <span className={`lead-badge ${call.response}`}>
                      {CALL_RESPONSES.find((item) => item.id === call.response)?.label}
                    </span>
                  </td>
                  <td>{call.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} title="Log a cold call" onClose={() => setOpen(false)}>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            await logCall({
              ...form,
              createLead: generateLead,
              followUpAt: generateLead && form.followUpAt ? new Date(form.followUpAt).toISOString() : undefined,
            });
            setOpen(false);
            setForm({
              name: "",
              phone: "",
              company: "",
              response: "no_answer",
              notes: "",
              createLead: false,
              followUpAt: "",
              followUpDetails: "",
            });
          }}
        >
          <Field label="Person name">
            <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label="Phone">
            <input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </Field>
          <Field label="Company">
            <input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
          </Field>
          <Field label="Response">
            <select
              value={form.response}
              onChange={(event) => setForm({ ...form, response: event.target.value as CallResponse })}
            >
              {CALL_RESPONSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="What did they say?">
            <input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </Field>
          {form.response !== "interested" ? (
            <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={form.createLead}
                onChange={(event) => setForm({ ...form, createLead: event.target.checked })}
              />
              <span>Lead generate ho gayi — send to Leads</span>
            </label>
          ) : (
            <p className="empty-note">This response will create a lead automatically.</p>
          )}
          {generateLead ? (
            <>
              <Field label="Follow-up reminder (optional)">
                <input
                  type="datetime-local"
                  value={form.followUpAt}
                  onChange={(event) => setForm({ ...form, followUpAt: event.target.value })}
                />
              </Field>
              <Field label="Follow-up details">
                <input
                  value={form.followUpDetails}
                  onChange={(event) => setForm({ ...form, followUpDetails: event.target.value })}
                  placeholder="What to discuss next"
                />
              </Field>
            </>
          ) : null}
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save call</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
