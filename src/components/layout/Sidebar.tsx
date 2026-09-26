"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  Building2,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Code2,
  Handshake,
  Home,
  MessageSquare,
  Phone,
  PieChart,
  Settings,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import { Brand, LoopsLogo } from "@/components/Brand";
import { cn } from "@/lib/utils";
import { useCrm } from "@/context/CrmContext";
import type { EmployeeRole } from "@/data/types";

const links: {
  href: string;
  label: string;
  icon: typeof Home;
  roles?: EmployeeRole[];
}[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/team-work", label: "Team work", icon: ClipboardList, roles: ["admin", "manager"] },
  { href: "/calls", label: "Cold calling", icon: Phone, roles: ["admin", "sales"] },
  { href: "/leads", label: "Leads", icon: UserPlus, roles: ["admin", "sales"] },
  { href: "/follow-ups", label: "Follow-ups", icon: Bell, roles: ["admin", "sales"] },
  { href: "/clients", label: "Clients", icon: BadgeCheck, roles: ["admin", "sales"] },
  { href: "/work", label: "Daily work", icon: Code2, roles: ["admin", "manager", "developer"] },
  { href: "/contacts", label: "Contacts", icon: Users, roles: ["admin", "sales", "support"] },
  { href: "/messages", label: "Team chat", icon: MessageSquare },
  { href: "/deals", label: "Deals", icon: Handshake, roles: ["admin", "sales"] },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, roles: ["admin", "manager", "sales", "developer", "support"] },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, roles: ["admin", "sales", "support"] },
  { href: "/companies", label: "Companies", icon: Building2, roles: ["admin", "sales", "support"] },
  { href: "/employees", label: "Team", icon: UserRound, roles: ["admin", "manager"] },
  { href: "/reports", label: "Reports", icon: PieChart, roles: ["admin", "manager"] },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const pathname = usePathname();
  const { currentEmployee } = useCrm();
  const role = currentEmployee.role;
  const visible = links.filter((link) => !link.roles || link.roles.includes(role));

  return (
    <aside className={cn("sidebar", open && "open")}>
      <Link href="/" className="brand" onClick={onNavigate}>
        <Brand />
      </Link>

      <nav className="nav-list">
        {visible.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/" && pathname.startsWith(`${link.href}/`));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn("nav-item", active && "active")}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        <div className="leaf">
          <LoopsLogo size="sm" />
        </div>
        <h3>Better relationships. Bigger opportunities.</h3>
        <p>Manage your customers, close more deals, grow together with Loops.</p>
      </div>
    </aside>
  );
}
