"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type {
  Activity,
  ColdCall,
  Company,
  Contact,
  CrmData,
  Deal,
  DealStage,
  DevWorkItem,
  DevWorkKind,
  Employee,
  FollowUpItem,
  FollowUpOutcome,
  Lead,
  LeadStatus,
  TaskItem,
  TaskType,
  UserProfile,
} from "@/data/types";
import { roleLabel } from "@/data/types";

interface WorkspacePayload extends CrmData {
  currentEmployee: Employee;
}

interface CrmContextValue extends CrmData {
  profile: UserProfile;
  currentEmployee: Employee;
  currentEmployeeId: string;
  hydrated: boolean;
  busy: boolean;
  error: string;
  isAdmin: boolean;
  canSeeAllWork: boolean;
  canSeeLeadDetails: boolean;
  canAssignWork: boolean;
  visibleContacts: Contact[];
  visibleDeals: Deal[];
  visibleTasks: TaskItem[];
  visibleThreads: CrmData["threads"];
  visibleActivities: Activity[];
  coldCalls: ColdCall[];
  leads: Lead[];
  followUps: FollowUpItem[];
  workLogs: DevWorkItem[];
  isDeveloper: boolean;
  isSales: boolean;
  companyById: (id: string) => Company | undefined;
  contactById: (id: string) => Contact | undefined;
  employeeById: (id: string) => Employee | undefined;
  workFor: (employeeId: string) => {
    contacts: Contact[];
    deals: Deal[];
    tasks: TaskItem[];
    threads: CrmData["threads"];
    activities: Activity[];
    coldCalls: ColdCall[];
    leads: Lead[];
    followUps: FollowUpItem[];
    workLogs: DevWorkItem[];
  };
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  addEmployee: (
    input: Omit<Employee, "id" | "status" | "joinedAt"> & { joinedAt?: string; password?: string },
  ) => Promise<void>;
  updateEmployee: (id: string, next: Partial<Employee>) => Promise<void>;
  addContact: (input: Omit<Contact, "id">) => Promise<void>;
  addCompany: (input: Omit<Company, "id">) => Promise<void>;
  addDeal: (input: Omit<Deal, "id">) => Promise<void>;
  addTask: (input: Omit<TaskItem, "id" | "done">) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  moveDeal: (id: string, stage: DealStage) => Promise<void>;
  sendMessage: (threadId: string, text: string) => Promise<void>;
  markThreadRead: (threadId: string) => Promise<void>;
  updateProfile: (next: Partial<UserProfile>) => Promise<void>;
  logCall: (input: {
    name: string;
    phone: string;
    company?: string;
    response: ColdCall["response"];
    notes?: string;
    createLead?: boolean;
    followUpAt?: string;
    followUpDetails?: string;
  }) => Promise<void>;
  addLead: (input: {
    name: string;
    phone: string;
    email?: string;
    company?: string;
    notes?: string;
    followUpAt?: string;
    followUpDetails?: string;
  }) => Promise<void>;
  scheduleFollowUp: (input: { leadId: string; dueAt: string; details: string }) => Promise<void>;
  completeFollowUp: (
    id: string,
    input: {
      result: string;
      outcome: Exclude<FollowUpOutcome, "pending">;
      nextDueAt?: string;
      nextDetails?: string;
    },
  ) => Promise<void>;
  updateLeadStatus: (id: string, status: LeadStatus, notes?: string) => Promise<void>;
  logWork: (input: {
    kind: DevWorkKind;
    title: string;
    details?: string;
    workedAt?: string;
  }) => Promise<void>;
}

const emptyEmployee: Employee = {
  id: "",
  name: "",
  greetingName: "",
  email: "",
  phone: "",
  role: "sales",
  title: "",
  department: "",
  joinedAt: "",
  bio: "",
  status: "active",
};

const CrmContext = createContext<CrmContextValue | null>(null);

function owned<T extends { ownerId?: string }>(items: T[], employeeId: string) {
  return items.filter((item) => item.ownerId === employeeId);
}

export function CrmProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [data, setData] = useState<WorkspacePayload | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const payload = await api<WorkspacePayload>("/api/bootstrap");
    setData(payload);
    setHydrated(true);
  }, []);

  useEffect(() => {
    refresh().catch(() => {
      router.push("/login");
    });
  }, [refresh, router]);

  const run = useCallback(
    async (work: () => Promise<void>) => {
      setBusy(true);
      setError("");
      try {
        await work();
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const currentEmployee = data?.currentEmployee ?? emptyEmployee;
  const employees = data?.employees ?? [];
  const companies = data?.companies ?? [];
  const contacts = data?.contacts ?? [];
  const deals = data?.deals ?? [];
  const tasks = data?.tasks ?? [];
  const threads = data?.threads ?? [];
  const activities = data?.activities ?? [];
  const coldCalls = data?.coldCalls ?? [];
  const leads = data?.leads ?? [];
  const followUps = data?.followUps ?? [];
  const workLogs = data?.workLogs ?? [];

  const value = useMemo<CrmContextValue>(() => {
    const isAdmin = currentEmployee.role === "admin";
    const canSeeAll = currentEmployee.role === "admin" || currentEmployee.role === "manager";
    const canSeeLeadDetails = currentEmployee.role === "admin" || currentEmployee.role === "sales";

    return {
      employees,
      companies,
      contacts,
      deals,
      tasks,
      threads,
      activities,
      coldCalls,
      leads,
      followUps,
      workLogs,
      profile: {
        name: currentEmployee.name,
        role: roleLabel(currentEmployee.role),
        email: currentEmployee.email,
        greetingName: currentEmployee.greetingName,
      },
      currentEmployee,
      currentEmployeeId: currentEmployee.id,
      hydrated,
      busy,
      error,
      isAdmin,
      canSeeAllWork: canSeeAll,
      canSeeLeadDetails,
      canAssignWork: isAdmin,
      isDeveloper: currentEmployee.role === "developer",
      isSales: currentEmployee.role === "sales",
      visibleContacts: contacts,
      visibleDeals: deals,
      visibleTasks: isAdmin ? tasks : tasks.filter((task) => task.ownerId === currentEmployee.id),
      visibleThreads: threads,
      visibleActivities: activities,
      companyById: (id) => companies.find((company) => company.id === id),
      contactById: (id) => contacts.find((contact) => contact.id === id),
      employeeById: (id) => employees.find((employee) => employee.id === id),
      workFor: (employeeId) => ({
        contacts: owned(contacts, employeeId),
        deals: owned(deals, employeeId),
        tasks: owned(tasks, employeeId),
        threads: owned(threads, employeeId),
        activities: owned(activities, employeeId),
        coldCalls: owned(coldCalls, employeeId),
        leads: owned(leads, employeeId),
        followUps: owned(followUps, employeeId),
        workLogs: owned(workLogs, employeeId),
      }),
      refresh,
      logout: async () => {
        await api("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      },
      addEmployee: (input) => run(() => api("/api/employees", { method: "POST", body: JSON.stringify(input) })),
      updateEmployee: (id, next) =>
        run(() => api(`/api/employees/${id}`, { method: "PATCH", body: JSON.stringify(next) })),
      addContact: (input) => run(() => api("/api/contacts", { method: "POST", body: JSON.stringify(input) })),
      addCompany: (input) => run(() => api("/api/companies", { method: "POST", body: JSON.stringify(input) })),
      addDeal: (input) => run(() => api("/api/deals", { method: "POST", body: JSON.stringify(input) })),
      addTask: (input) => run(() => api("/api/tasks", { method: "POST", body: JSON.stringify(input) })),
      toggleTask: (id) => run(() => api(`/api/tasks/${id}`, { method: "PATCH" })),
      moveDeal: (id, stage) =>
        run(() => api(`/api/deals/${id}`, { method: "PATCH", body: JSON.stringify({ stage }) })),
      sendMessage: (threadId, text) =>
        run(() => api(`/api/messages/${threadId}`, { method: "POST", body: JSON.stringify({ text }) })),
      markThreadRead: (threadId) => run(() => api(`/api/messages/${threadId}`, { method: "PATCH" })),
      updateProfile: (next) => run(() => api("/api/profile", { method: "PATCH", body: JSON.stringify(next) })),
      logCall: (input) => run(() => api("/api/calls", { method: "POST", body: JSON.stringify(input) })),
      addLead: (input) => run(() => api("/api/leads", { method: "POST", body: JSON.stringify(input) })),
      scheduleFollowUp: (input) =>
        run(() => api("/api/follow-ups", { method: "POST", body: JSON.stringify(input) })),
      completeFollowUp: (id, input) =>
        run(() => api(`/api/follow-ups/${id}`, { method: "PATCH", body: JSON.stringify(input) })),
      updateLeadStatus: (id, status, notes) =>
        run(() => api(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify({ status, notes }) })),
      logWork: (input) => run(() => api("/api/work", { method: "POST", body: JSON.stringify(input) })),
    };
  }, [
    activities,
    coldCalls,
    followUps,
    leads,
    workLogs,
    busy,
    companies,
    contacts,
    currentEmployee,
    deals,
    employees,
    error,
    hydrated,
    refresh,
    router,
    run,
    tasks,
    threads,
  ]);

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error("useCrm must be used within CrmProvider");
  return ctx;
}

export const TASK_TYPES: { id: TaskType; label: string }[] = [
  { id: "call", label: "Call" },
  { id: "email", label: "Email" },
  { id: "meeting", label: "Meeting" },
  { id: "task", label: "Task" },
];
