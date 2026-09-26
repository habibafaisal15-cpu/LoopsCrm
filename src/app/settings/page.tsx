"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useCrm } from "@/context/CrmContext";
import { Button, Card, Field, PageHeader } from "@/components/ui";

export default function SettingsPage() {
  const { profile, updateProfile, currentEmployee, isAdmin, employees } = useCrm();
  const { theme, setTheme } = useTheme();
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  return (
    <>
      <PageHeader title="Settings" subtitle="Your workspace identity and team access." />
      <div className="settings-grid">
        <Card className="settings-card">
          <h2>My profile</h2>
          <p>This updates the employee record you are currently working as.</p>
          <form
            className="form-grid"
            onSubmit={async (event) => {
              event.preventDefault();
              await updateProfile(form);
              setSaved(true);
              setTimeout(() => setSaved(false), 1800);
            }}
          >
            <Field label="Full name">
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </Field>
            <Field label="Greeting name">
              <input
                value={form.greetingName}
                onChange={(event) => setForm({ ...form, greetingName: event.target.value })}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </Field>
            <Field label="Role">
              <input value={form.role} readOnly />
            </Field>
            <div className="modal-actions">
              <Button type="submit">{saved ? "Saved" : "Save changes"}</Button>
            </div>
          </form>
        </Card>
        <Card className="settings-card">
          <h2>Appearance</h2>
          <p>Switch between light and dark. The Loops cyan-to-pink palette stays in both modes.</p>
          <div className="theme-picks">
            <button
              type="button"
              className={`theme-pick ${theme === "light" ? "active" : ""}`}
              onClick={() => setTheme("light")}
            >
              <strong>Light</strong>
              <span>Bright workspace</span>
            </button>
            <button
              type="button"
              className={`theme-pick ${theme === "dark" ? "active" : ""}`}
              onClick={() => setTheme("dark")}
            >
              <strong>Dark</strong>
              <span>Matches the Loops logo</span>
            </button>
          </div>
        </Card>
        <Card className="settings-card">
          <h2>Team access</h2>
          <p>
            {isAdmin
              ? "You can add employees, set their role, and open each profile to see the work they have done."
              : "Sales and support only see their own contacts, deals, tasks and messages. Ask an admin to change your role."}
          </p>
          <div className="company-meta">
            <span className="chip">{employees.length} employees</span>
            <span className="chip">{currentEmployee.department}</span>
            <span className="chip">{currentEmployee.title}</span>
          </div>
          <div className="toolbar">
            <Link href={`/employees/${currentEmployee.id}`} className="btn outline">
              Open my work
            </Link>
            <Link href="/employees" className="btn primary">
              {isAdmin ? "Manage team" : "View team"}
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
