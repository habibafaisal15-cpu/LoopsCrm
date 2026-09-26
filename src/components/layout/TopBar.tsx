"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCrm } from "@/context/CrmContext";
import { Avatar } from "@/components/ui";

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const {
    visibleContacts,
    companies,
    visibleDeals,
    leads,
    employees,
    currentEmployee,
    profile,
    logout,
    unreadChatCount,
    canSeeLeadDetails,
  } = useCrm();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const contactHits = canSeeLeadDetails
      ? visibleContacts
          .filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
          .slice(0, 3)
          .map((c) => ({ href: "/contacts", label: c.name, kind: "Contact" }))
      : [];
    const companyHits = canSeeLeadDetails
      ? companies
          .filter((c) => c.name.toLowerCase().includes(q))
          .slice(0, 3)
          .map((c) => ({ href: "/companies", label: c.name, kind: "Company" }))
      : [];
    const dealHits = canSeeLeadDetails
      ? visibleDeals
          .filter((d) => d.title.toLowerCase().includes(q))
          .slice(0, 3)
          .map((d) => ({ href: "/deals", label: d.title, kind: "Deal" }))
      : [];
    const leadHits = canSeeLeadDetails
      ? leads
          .filter((l) => l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.company.toLowerCase().includes(q))
          .slice(0, 3)
          .map((l) => ({ href: "/leads", label: `${l.name} · ${l.phone}`, kind: "Lead" }))
      : [];
    const employeeHits = employees
      .filter((e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q))
      .slice(0, 3)
      .map((e) => ({ href: `/employees/${e.id}`, label: e.name, kind: "Employee" }));
    return [...leadHits, ...employeeHits, ...contactHits, ...companyHits, ...dealHits];
  }, [query, visibleContacts, companies, visibleDeals, leads, employees, canSeeLeadDetails]);

  return (
    <header className="topbar">
      <button className="icon-btn mobile-toggle" onClick={onMenu} aria-label="Open menu">
        <Menu size={18} />
      </button>

      <div className="search">
        <Search size={16} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={canSeeLeadDetails ? "Search leads, numbers, contacts, team..." : "Search team..."}
        />
        {results.length > 0 ? (
          <div className="search-results">
            {results.map((item) => (
              <Link key={`${item.kind}-${item.label}`} href={item.href} onClick={() => setQuery("")}>
                <span>{item.label}</span>
                <span className="muted-kind">{item.kind}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div className="top-actions">
        <ThemeToggle compact />
        <Link href="/messages" className="bell-wrap icon-btn" aria-label="Team chat">
          <Bell size={18} />
          {unreadChatCount > 0 ? (
            <span className="nav-badge">{unreadChatCount > 99 ? "99+" : unreadChatCount}</span>
          ) : null}
        </Link>
        <div className="user-menu">
          <button className="user-chip" onClick={() => setMenuOpen((value) => !value)}>
            <Avatar name={currentEmployee.name || "User"} />
            <span className="meta">
              <strong>{profile.name || "Loading"}</strong>
              <span>{profile.role || "…"}</span>
            </span>
            <ChevronDown size={14} color="var(--muted)" />
          </button>
          {menuOpen ? (
            <div className="user-dropdown">
              <p className="dropdown-label">Signed in</p>
              <Link
                href={`/employees/${currentEmployee.id}`}
                className="dropdown-link"
                onClick={() => setMenuOpen(false)}
              >
                Open my profile
              </Link>
              <Link href="/employees" className="dropdown-link" onClick={() => setMenuOpen(false)}>
                View team
              </Link>
              <button
                className="dropdown-link"
                onClick={() => {
                  setMenuOpen(false);
                  void logout();
                }}
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
