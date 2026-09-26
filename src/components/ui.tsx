"use client";

import { X } from "lucide-react";
import type { DealStage, EmployeeRole, TaskType } from "@/data/types";
import { roleLabel } from "@/data/types";
import { cn, initials } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={cn("card", className)}>{children}</section>;
}

export function Button({
  children,
  className,
  variant = "primary",
  type = "button",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "ghost" | "outline";
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button type={type} onClick={onClick} className={cn("btn", variant, className)}>
      {children}
    </button>
  );
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={cn("avatar", size)} aria-hidden>
      {initials(name)}
    </span>
  );
}

const stageClass: Record<DealStage, string> = {
  new: "badge new",
  contacted: "badge contacted",
  qualified: "badge qualified",
  proposal: "badge proposal",
  won: "badge won",
};

export function StatusBadge({ stage, label }: { stage: DealStage; label?: string }) {
  const text =
    label ??
    ({
      new: "New",
      contacted: "Contacted",
      qualified: "Qualified",
      proposal: "Proposal",
      won: "Won",
    }[stage]);
  return <span className={stageClass[stage]}>{text}</span>;
}

const typeClass: Record<TaskType, string> = {
  call: "type-pill call",
  email: "type-pill email",
  meeting: "type-pill meeting",
  task: "type-pill task",
};

export function RoleBadge({ role }: { role: EmployeeRole }) {
  return <span className={`role-badge ${role}`}>{roleLabel(role)}</span>;
}

export function TypePill({ type }: { type: TaskType }) {
  const label = { call: "Call", email: "Email", meeting: "Meeting", task: "Task" }[type];
  return <span className={typeClass[type]}>{label}</span>;
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
