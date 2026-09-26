"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { Button, Card, Field, Modal, PageHeader } from "@/components/ui";

export default function CompaniesPage() {
  const { companies, contacts, addCompany } = useCrm();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    industry: "",
    city: "",
    employees: 10,
    website: "",
  });

  const rows = useMemo(
    () =>
      companies.filter((company) =>
        `${company.name} ${company.industry} ${company.city}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [companies, query],
  );

  return (
    <>
      <PageHeader
        title="Companies"
        subtitle="Accounts and the teams behind your pipeline."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} />
            Add company
          </Button>
        }
      />

      <div className="toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search companies"
        />
      </div>

      <div className="cards-grid">
        {rows.map((company) => {
          const people = contacts.filter((contact) => contact.companyId === company.id).length;
          return (
            <Card key={company.id} className="company-card">
              <h3>{company.name}</h3>
              <p>{company.website}</p>
              <div className="company-meta">
                <span className="chip">{company.industry}</span>
                <span className="chip">{company.city}</span>
                <span className="chip">{people} contacts</span>
                <span className="chip">{company.employees} staff</span>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={open} title="Add company" onClose={() => setOpen(false)}>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            await addCompany(form);
            setOpen(false);
            setForm({ name: "", industry: "", city: "", employees: 10, website: "" });
          }}
        >
          <Field label="Company name">
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </Field>
          <Field label="Industry">
            <input
              value={form.industry}
              onChange={(event) => setForm({ ...form, industry: event.target.value })}
            />
          </Field>
          <Field label="City">
            <input
              value={form.city}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
            />
          </Field>
          <Field label="Website">
            <input
              value={form.website}
              onChange={(event) => setForm({ ...form, website: event.target.value })}
            />
          </Field>
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save company</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
