"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
