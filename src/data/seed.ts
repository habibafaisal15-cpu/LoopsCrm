import type { CrmData, Employee } from "./types";

export const ADMIN_ID = "emp-1";

export const employees: Employee[] = [
  {
    id: ADMIN_ID,
    name: "Habiba",
    greetingName: "Habiba",
    email: "habiba@loopscrm.com",
    phone: "",
    role: "admin",
    title: "Admin",
    department: "Leadership",
    joinedAt: "2024-01-08",
    bio: "",
    status: "active",
  },
];

export const seed: CrmData = {
  employees,
  companies: [],
  contacts: [],
  deals: [],
  tasks: [],
  threads: [],
  activities: [],
  coldCalls: [],
  leads: [],
  followUps: [],
  workLogs: [],
};
