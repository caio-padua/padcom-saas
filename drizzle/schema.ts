import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";

// ─── USERS (auth) ──────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── PATIENTS ──────────────────────────────────────────────────
export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }),
  birthDate: varchar("birthDate", { length: 10 }),
  sex: mysqlEnum("sex", ["M", "F", "O"]),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  accessToken: varchar("accessToken", { length: 64 }).notNull().unique(),
  notes: text("notes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Patient = typeof patients.$inferSelect;

// ─── CONSULTANTS (enfermeiras, biomédicas, etc.) ───────────────
export const consultants = mysqlTable("consultants", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  isActive: boolean("isActive").default(true).notNull(),
  canAccessIntegrative: boolean("canAccessIntegrative").default(true).notNull(),
  canAccessAesthetic: boolean("canAccessAesthetic").default(false).notNull(),
  canAccessReports: boolean("canAccessReports").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Consultant = typeof consultants.$inferSelect;

// ─── ANAMNESIS QUESTIONS (CRUD dinâmico) ───────────────────────
export const anamnesisQuestions = mysqlTable("anamnesis_questions", {
  id: int("id").autoincrement().primaryKey(),
  category: mysqlEnum("category", ["integrativa", "estetica"]).notNull(),
  section: varchar("section", { length: 100 }).notNull(),
  questionText: text("questionText").notNull(),
  fieldType: mysqlEnum("fieldType", ["text", "number", "scale", "select", "multiselect", "checkbox", "date", "textarea"]).notNull(),
  options: json("options"),
  scaleMin: int("scaleMin"),
  scaleMax: int("scaleMax"),
  isRequired: boolean("isRequired").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AnamnesisQuestion = typeof anamnesisQuestions.$inferSelect;

// ─── ANAMNESIS SESSIONS ────────────────────────────────────────
export const anamnesisSessions = mysqlTable("anamnesis_sessions", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  category: mysqlEnum("category", ["integrativa", "estetica"]).notNull(),
  conductedById: int("conductedById"),
  conductedByType: mysqlEnum("conductedByType", ["medico", "consultora", "paciente"]).default("medico"),
  status: mysqlEnum("status", ["rascunho", "em_andamento", "concluida"]).default("rascunho").notNull(),
  notes: text("notes"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AnamnesisSession = typeof anamnesisSessions.$inferSelect;

// ─── ANAMNESIS RESPONSES ───────────────────────────────────────
export const anamnesisResponses = mysqlTable("anamnesis_responses", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  questionId: int("questionId").notNull(),
  answerText: text("answerText"),
  answerNumber: decimal("answerNumber", { precision: 10, scale: 2 }),
  answerJson: json("answerJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AnamnesisResponse = typeof anamnesisResponses.$inferSelect;

// ─── PRESCRIPTIONS (fórmulas) ──────────────────────────────────
export const prescriptions = mysqlTable("prescriptions", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  via: varchar("via", { length: 50 }),
  form: varchar("form", { length: 50 }),
  dosage: varchar("dosage", { length: 100 }),
  frequency: varchar("frequency", { length: 100 }),
  duration: varchar("duration", { length: 50 }),
  objective: text("objective"),
  status: mysqlEnum("status", ["ativa", "pausada", "encerrada"]).default("ativa").notNull(),
  prescribedAt: timestamp("prescribedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Prescription = typeof prescriptions.$inferSelect;

// ─── PRESCRIPTION COMPONENTS ───────────────────────────────────
export const prescriptionComponents = mysqlTable("prescription_components", {
  id: int("id").autoincrement().primaryKey(),
  prescriptionId: int("prescriptionId").notNull(),
  componentName: varchar("componentName", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }),
  unit: varchar("unit", { length: 20 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  notes: text("notes"),
});
export type PrescriptionComponent = typeof prescriptionComponents.$inferSelect;

// ─── DAILY REPORTS (Via 3 — relatos diários) ───────────────────
export const dailyReports = mysqlTable("daily_reports", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  reportDate: varchar("reportDate", { length: 10 }).notNull(),
  period: mysqlEnum("period", ["manha", "tarde", "noite"]).notNull(),
  sleep: decimal("sleep", { precision: 4, scale: 1 }),
  energy: decimal("energy", { precision: 4, scale: 1 }),
  mood: decimal("mood", { precision: 4, scale: 1 }),
  focus: decimal("focus", { precision: 4, scale: 1 }),
  concentration: decimal("concentration", { precision: 4, scale: 1 }),
  libido: decimal("libido", { precision: 4, scale: 1 }),
  strength: decimal("strength", { precision: 4, scale: 1 }),
  physicalActivity: decimal("physicalActivity", { precision: 4, scale: 1 }),
  systolicBP: int("systolicBP"),
  diastolicBP: int("diastolicBP"),
  weight: decimal("weight", { precision: 5, scale: 1 }),
  generalNotes: text("generalNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type DailyReport = typeof dailyReports.$inferSelect;

// ─── PRESCRIPTION REPORTS (relatos vinculados a fórmulas) ──────
export const prescriptionReports = mysqlTable("prescription_reports", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  prescriptionId: int("prescriptionId").notNull(),
  reportType: mysqlEnum("reportType", ["reacao_adversa", "melhora", "sem_efeito", "duvida", "outro"]).notNull(),
  severity: mysqlEnum("severity", ["leve", "moderada", "grave"]).default("leve").notNull(),
  description: text("description").notNull(),
  reportedAt: timestamp("reportedAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
  resolvedById: int("resolvedById"),
  resolutionNotes: text("resolutionNotes"),
  status: mysqlEnum("status", ["aberto", "em_analise", "resolvido"]).default("aberto").notNull(),
});
export type PrescriptionReport = typeof prescriptionReports.$inferSelect;

// ─── ALERTS ────────────────────────────────────────────────────
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  priority: mysqlEnum("priority", ["baixa", "moderada", "alta", "critica"]).default("moderada").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  source: varchar("source", { length: 100 }),
  sourceId: int("sourceId"),
  status: mysqlEnum("status", ["ativo", "em_analise", "resolvido", "descartado"]).default("ativo").notNull(),
  assignedToId: int("assignedToId"),
  resolvedAt: timestamp("resolvedAt"),
  resolutionNotes: text("resolutionNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Alert = typeof alerts.$inferSelect;

// ─── ALERT RULES ───────────────────────────────────────────────
export const alertRules = mysqlTable("alert_rules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  source: varchar("source", { length: 100 }).notNull(),
  condition: text("conditionExpr").notNull(),
  alertCategory: varchar("alertCategory", { length: 100 }).notNull(),
  alertPriority: mysqlEnum("alertPriority", ["baixa", "moderada", "alta", "critica"]).default("moderada").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AlertRule = typeof alertRules.$inferSelect;

// ─── FOLLOW-UP SESSIONS ────────────────────────────────────────
export const followUpSessions = mysqlTable("follow_up_sessions", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  sessionType: mysqlEnum("sessionType", ["presencial", "online"]).default("presencial").notNull(),
  conductedById: int("conductedById"),
  sessionDate: timestamp("sessionDate").notNull(),
  clinicalScore: decimal("clinicalScore", { precision: 5, scale: 1 }),
  scoreBreakdown: json("scoreBreakdown"),
  notes: text("notes"),
  status: mysqlEnum("status", ["agendada", "realizada", "cancelada"]).default("agendada").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type FollowUpSession = typeof followUpSessions.$inferSelect;

// ─── EXAMS ─────────────────────────────────────────────────────
export const exams = mysqlTable("exams", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  examName: varchar("examName", { length: 255 }).notNull(),
  value: varchar("value", { length: 100 }),
  unit: varchar("unit", { length: 50 }),
  referenceMin: varchar("referenceMin", { length: 50 }),
  referenceMax: varchar("referenceMax", { length: 50 }),
  classification: varchar("classification", { length: 50 }),
  examDate: varchar("examDate", { length: 10 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Exam = typeof exams.$inferSelect;

// ─── AUDIT LOG ─────────────────────────────────────────────────
export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 100 }).notNull(),
  entityId: int("entityId"),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AuditLogEntry = typeof auditLog.$inferSelect;
