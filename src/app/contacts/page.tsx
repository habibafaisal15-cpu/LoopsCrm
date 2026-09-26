"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DEAL_STAGES } from "@/data/types";
import { useCrm } from "@/context/CrmContext";
import { Avatar, Button, Field, Modal, PageHeader, StatusBadge } from "@/components/ui";

export default function ContactsPage() {
  const {
    visibleContacts,
    companies,
    employees,
    addContact,
    companyById,
    employeeById,
    currentEmployee,
    canAssignWork,
  } = useCrm();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    companyId: companies[0]?.id ?? "",
    status: "new" as const,
    title: "",
    ownerId: currentEmployee.id,
  });

  const rows = useMemo(
    () =>
      visibleContacts.filter((contact) => {
        const haystack = `${contact.name} ${contact.email} ${contact.phone}`.toLowerCase();
        const matchesQuery = haystack.includes(query.toLowerCase());
        const matchesStatus = status === "all" || contact.status === status;
        return matchesQuery && matchesStatus;
      }),
    [visibleContacts, query, status],
  );

  return (
    <>
      <PageHeader
        title="Contacts"
        subtitle="People you are building relationships with."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} />
            Add contact
          </Button>
        }
      />

      <div className="toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, email or phone"
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          {DEAL_STAGES.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.label}
            </option>
          ))}
        </select>
      </div>

      <section className="card">
        <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Title</th>
              <th>Company</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Owner</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((contact) => (
              <tr key={contact.id}>
                <td>
                  <div className="person">
                    <Avatar name={contact.name} size="sm" />
                    {contact.name}
                  </div>
                </td>
                <td>{contact.title}</td>
                <td>{companyById(contact.companyId)?.name}</td>
                <td>{contact.email}</td>
                <td>{contact.phone}</td>
                <td>{employeeById(contact.ownerId)?.name}</td>
                <td>
                  <StatusBadge stage={contact.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>

      <Modal open={open} title="Add contact" onClose={() => setOpen(false)}>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            await addContact(form);
            setOpen(false);
            setForm({
              name: "",
              email: "",
              phone: "",
              companyId: companies[0]?.id ?? "",
              status: "new",
              title: "",
              ownerId: currentEmployee.id,
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
          <Field label="Title">
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
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
            <Button type="submit">Save contact</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
