export type DealStage = "new" | "contacted" | "qualified" | "proposal" | "won";
export type TaskType = "call" | "email" | "meeting" | "task";
export type ActivityType = "call" | "email" | "meeting" | "deal" | "message" | "work";
export type EmployeeRole = "admin" | "manager" | "sales" | "support" | "developer";
export type EmployeeStatus = "active" | "inactive";

export const DEAL_STAGES: { id: DealStage; label: string }[] = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "qualified", label: "Qualified" },
  { id: "proposal", label: "Proposal" },
  { id: "won", label: "Won" },
];

export const PIPELINE_STAGES: { id: DealStage; label: string }[] = [
  { id: "new", label: "New Leads" },
  { id: "contacted", label: "Contacted" },
  { id: "qualified", label: "Qualified" },
  { id: "proposal", label: "Proposal" },
  { id: "won", label: "Won" },
];

export const EMPLOYEE_ROLES: { id: EmployeeRole; label: string; description: string }[] = [
  { id: "admin", label: "Admin", description: "See every lead and phone number, add employees, and review all work" },
  { id: "manager", label: "Manager", description: "See team counts and log daily tasks. Admin sees tasks you mark done." },
  { id: "sales", label: "Business Developer", description: "Daily cold calls, leads, follow-ups, clients and your own tasks" },
  { id: "developer", label: "Developer", description: "Log websites, POS builds, discussions, ideas and daily tasks" },
  { id: "support", label: "Support", description: "Own conversations and customer tasks" },
];

export interface Employee {
  id: string;
  name: string;
  greetingName: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  title: string;
  department: string;
  joinedAt: string;
  bio: string;
  status: EmployeeStatus;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyId: string;
  status: DealStage;
  title: string;
  ownerId: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  city: string;
  employees: number;
  website: string;
}

export interface Deal {
  id: string;
  title: string;
  companyId: string;
  contactId: string;
  value: number;
  stage: DealStage;
  closeDate: string;
  ownerId: string;
}

export interface TaskItem {
  id: string;
  title: string;
  dueAt: string;
  type: TaskType;
  done: boolean;
  completedAt?: string;
  companyId?: string;
  contactId?: string;
  ownerId: string;
}

export interface MessageThread {
  id: string;
  contactId: string;
  ownerId: string;
  unread: boolean;
  updatedAt: string;
  messages: { id: string; from: "me" | "them"; text: string; time: string }[];
}

export interface Activity {
  id: string;
  type: ActivityType;
  text: string;
  detail?: string;
  time: string;
  ownerId: string;
}

export type CallResponse = "no_answer" | "busy" | "not_interested" | "callback" | "interested";
export type LeadStatus = "open" | "following" | "client" | "wasted";
export type FollowUpOutcome = "pending" | "next" | "client" | "wasted";

export const CALL_RESPONSES: { id: CallResponse; label: string }[] = [
  { id: "no_answer", label: "No answer" },
  { id: "busy", label: "Busy" },
  { id: "not_interested", label: "Not interested" },
  { id: "callback", label: "Call back later" },
  { id: "interested", label: "Lead generated" },
];

export const LEAD_STATUSES: { id: LeadStatus; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "following", label: "Follow-up" },
  { id: "client", label: "Client" },
  { id: "wasted", label: "Wasted" },
];

export interface ColdCall {
  id: string;
  calledAt: string;
  name: string;
  phone: string;
  company: string;
  response: CallResponse;
  notes: string;
  ownerId: string;
  leadId?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  source: string;
  status: LeadStatus;
  notes: string;
  ownerId: string;
  createdAt: string;
  closedAt?: string;
}

export interface FollowUpItem {
  id: string;
  leadId: string;
  ownerId: string;
  dueAt: string;
  details: string;
  outcome: FollowUpOutcome;
  result: string;
  createdAt: string;
}

export type DevWorkKind = "website" | "pos" | "discussion" | "idea" | "additional";

export const DEV_WORK_KINDS: { id: DevWorkKind; label: string }[] = [
  { id: "website", label: "Website" },
  { id: "pos", label: "POS" },
  { id: "discussion", label: "Discussion" },
  { id: "idea", label: "Idea" },
  { id: "additional", label: "Additional work" },
];

export interface DevWorkItem {
  id: string;
  workedAt: string;
  kind: DevWorkKind;
  title: string;
  details: string;
  ownerId: string;
}

export interface TeamChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: string;
}

export interface CrmData {
  employees: Employee[];
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
  tasks: TaskItem[];
  threads: MessageThread[];
  activities: Activity[];
  coldCalls: ColdCall[];
  leads: Lead[];
  followUps: FollowUpItem[];
  workLogs: DevWorkItem[];
  teamMessages: TeamChatMessage[];
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  greetingName: string;
}

export function roleLabel(role: EmployeeRole) {
  return EMPLOYEE_ROLES.find((item) => item.id === role)?.label ?? role;
}
