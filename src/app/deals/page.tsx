"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DEAL_STAGES, PIPELINE_STAGES, type DealStage } from "@/data/types";
import { useCrm } from "@/context/CrmContext";
import { Button, Field, Modal, PageHeader } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

export default function DealsPage() {
  const {
    visibleDeals,
    companies,
    visibleContacts,
    employees,
    addDeal,
    moveDeal,
    companyById,
    contactById,
    employeeById,
    currentEmployee,
    canAssignWork,
  } = useCrm();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    companyId: companies[0]?.id ?? "",
    contactId: visibleContacts[0]?.id ?? "",
    value: 5000,
    stage: "new" as DealStage,
    closeDate: new Date().toISOString().slice(0, 10),
    ownerId: currentEmployee.id,
  });

  return (
    <>
      <PageHeader
        title="Deals"
        subtitle="Move opportunities through the pipeline."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} />
            Add deal
          </Button>
        }
      />

      <div className="kanban">
        {PIPELINE_STAGES.map((stage) => {
          const column = visibleDeals.filter((deal) => deal.stage === stage.id);
          return (
            <div
              key={stage.id}
              className="kanban-col"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                const id = event.dataTransfer.getData("text/plain");
                if (id) moveDeal(id, stage.id);
              }}
            >
              <h3>
                {stage.label}
                <span>{column.length}</span>
              </h3>
              {column.map((deal) => (
                <article
                  key={deal.id}
                  className="deal-card"
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData("text/plain", deal.id)}
                >
                  <h4>{deal.title}</h4>
                  <p>{companyById(deal.companyId)?.name}</p>
                  <p>{contactById(deal.contactId)?.name}</p>
                  <p>{employeeById(deal.ownerId)?.name}</p>
                  <div className="value">{formatCurrency(deal.value)}</div>
                </article>
              ))}
            </div>
          );
        })}
      </div>

      <Modal open={open} title="Add deal" onClose={() => setOpen(false)}>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            await addDeal({
              ...form,
              ownerId: canAssignWork ? form.ownerId : currentEmployee.id,
              closeDate: new Date(form.closeDate).toISOString(),
            });
            setOpen(false);
          }}
        >
          <Field label="Deal title">
            <input
              required
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </Field>
          <Field label="Company">
            <select
              value={form.companyId}
              onChange={(event) => setForm({ ...form, companyId: event.target.value })}
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Contact">
            <select
              value={form.contactId}
              onChange={(event) => setForm({ ...form, contactId: event.target.value })}
            >
              {visibleContacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Value">
            <input
              type="number"
              min={0}
              value={form.value}
              onChange={(event) => setForm({ ...form, value: Number(event.target.value) })}
            />
          </Field>
          <Field label="Stage">
            <select
              value={form.stage}
              onChange={(event) => setForm({ ...form, stage: event.target.value as DealStage })}
            >
              {DEAL_STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
                </option>
              ))}
            </select>
          </Field>
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
            <Button type="submit">Save deal</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
