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
  clinicId: int("clinicId"),
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
  clinicId: int("clinicId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Consultant = typeof consultants.$inferSelect;

// ─── ANAMNESIS QUESTIONS (CRUD dinâmico) ───────────────────────
export const anamnesisQuestions = mysqlTable("anamnesis_questions", {
  id: int("id").autoincrement().primaryKey(),
  category: mysqlEnum("category", ["integrativa", "estetica", "relato_diario"]).notNull(),
  section: varchar("section", { length: 100 }).notNull(),
  questionText: text("questionText").notNull(),
  fieldType: mysqlEnum("fieldType", ["text", "number", "scale", "select", "multiselect", "checkbox", "date", "textarea"]).notNull(),
  options: json("options"),
  scaleMin: int("scaleMin"),
  scaleMax: int("scaleMax"),
  isRequired: boolean("isRequired").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  code: varchar("code", { length: 50 }),
  block: varchar("block", { length: 50 }),
  step: int("step"),
  clinicalGoal: text("clinicalGoal"),
  commercialGoal: text("commercialGoal"),
  helper: text("helper"),
  technicalName: varchar("technicalName", { length: 255 }),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  videoUrl: varchar("videoUrl", { length: 500 }),
  clinicId: int("clinicId"),
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
  clinicId: int("clinicId"),
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
  clinicId: int("clinicId"),
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
  clinicId: int("clinicId"),
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

// ─── SCORING WEIGHTS (motor de score V15) ─────────────────────
export const scoringWeights = mysqlTable("scoring_weights", {
  id: int("id").autoincrement().primaryKey(),
  questionCode: varchar("questionCode", { length: 50 }).notNull(),
  axis: varchar("axis", { length: 50 }).notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  maxRawPoints: int("maxRawPoints").default(10).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});
export type ScoringWeight = typeof scoringWeights.$inferSelect;

// ─── SCORING BANDS (faixas de conduta) ────────────────────────
export const scoringBands = mysqlTable("scoring_bands", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  minScore: int("minScore").notNull(),
  maxScore: int("maxScore").notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }),
  actions: json("actions"),
  sortOrder: int("sortOrder").default(0).notNull(),
});
export type ScoringBand = typeof scoringBands.$inferSelect;

// ─── MOTOR ACTIONS (regras determinísticas) ───────────────────
export const motorActions = mysqlTable("motor_actions", {
  id: int("id").autoincrement().primaryKey(),
  triggerCode: varchar("triggerCode", { length: 50 }).notNull(),
  triggerCondition: varchar("triggerCondition", { length: 100 }).notNull(),
  actionType: mysqlEnum("actionType", ["formula", "exame", "encaminhamento", "alerta", "painel"]).notNull(),
  actionValue: text("actionValue").notNull(),
  priority: int("priority").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});
export type MotorAction = typeof motorActions.$inferSelect;

// ─── CLINICAL FLAGS (validação humana obrigatória) ────────────
export const clinicalFlags = mysqlTable("clinical_flags", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  flagType: mysqlEnum("flagType", ["validation", "warning", "info"]).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  description: text("description").notNull(),
  source: varchar("source", { length: 100 }),
  sourceId: int("sourceId"),
  status: mysqlEnum("status", ["pendente", "aprovado", "rejeitado"]).default("pendente").notNull(),
  validatedById: int("validatedById"),
  validatedAt: timestamp("validatedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ClinicalFlag = typeof clinicalFlags.$inferSelect;

// ─── FUNNEL STATUS (funil comercial) ──────────────────────────
export const funnelStatus = mysqlTable("funnel_status", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  stage: mysqlEnum("stage", ["iniciou_e_parou", "concluiu_clinico", "concluiu_financeiro", "alto_interesse", "convertido"]).notNull(),
  scoreBand: varchar("scoreBand", { length: 50 }),
  score: int("score"),
  stoppedAtStep: int("stoppedAtStep"),
  stoppedAtModule: varchar("stoppedAtModule", { length: 50 }),
  notes: text("notes"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type FunnelStatus = typeof funnelStatus.$inferSelect;

// ─── MEDICATIONS (matriz dosada V16) ──────────────────────────
export const medications = mysqlTable("medications", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  dosageUnit: varchar("dosageUnit", { length: 50 }),
  dosageValue: decimal("dosageValue", { precision: 10, scale: 2 }),
  associatedDisease: varchar("associatedDisease", { length: 100 }),
  morningQty: int("morningQty").default(0).notNull(),
  afternoonQty: int("afternoonQty").default(0).notNull(),
  nightQty: int("nightQty").default(0).notNull(),
  totalDaily: int("totalDaily").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Medication = typeof medications.$inferSelect;

// ─── FLOW CONFIG (governança e roteamento) ────────────────────
export const flowConfig = mysqlTable("flow_config", {
  id: int("id").autoincrement().primaryKey(),
  configKey: varchar("configKey", { length: 100 }).notNull().unique(),
  configValue: varchar("configValue", { length: 50 }).notNull(),
  showToggle: boolean("showToggle").default(true).notNull(),
  description: text("description"),
  ifOn: text("ifOn"),
  ifOff: text("ifOff"),
  defaultProfile: varchar("defaultProfile", { length: 50 }),
  notes: text("notes"),
});
export type FlowConfig = typeof flowConfig.$inferSelect;

// ─── CLINICAL SYSTEMS (painéis por sistema clínico V16) ──────
export const clinicalSystems = mysqlTable("clinical_systems", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  system: mysqlEnum("system", ["cardiovascular", "metabolico", "endocrino", "digestivo", "neuro_humor", "sono", "atividade_fisica"]).notNull(),
  conditionCode: varchar("conditionCode", { length: 50 }).notNull(),
  conditionName: varchar("conditionName", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["diagnosticado", "potencial", "descartado", "em_investigacao"]).default("potencial").notNull(),
  severity: mysqlEnum("severity", ["leve", "moderado", "grave"]).default("leve"),
  notes: text("notes"),
  diagnosedAt: varchar("diagnosedAt", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ClinicalSystem = typeof clinicalSystems.$inferSelect;

// ─── SLEEP DETAIL (4 sub-escalas de sono V16) ────────────────
export const sleepDetails = mysqlTable("sleep_details", {
  id: int("id").autoincrement().primaryKey(),
  dailyReportId: int("dailyReportId").notNull(),
  patientId: int("patientId").notNull(),
  fallingAsleep: decimal("fallingAsleep", { precision: 4, scale: 1 }),
  waking: decimal("waking", { precision: 4, scale: 1 }),
  fragmented: decimal("fragmented", { precision: 4, scale: 1 }),
  daytimeSleepiness: decimal("daytimeSleepiness", { precision: 4, scale: 1 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SleepDetail = typeof sleepDetails.$inferSelect;

// ─── PHYSICAL ACTIVITY DETAIL (sub-bloco V16) ────────────────
export const physicalActivityDetails = mysqlTable("physical_activity_details", {
  id: int("id").autoincrement().primaryKey(),
  dailyReportId: int("dailyReportId").notNull(),
  patientId: int("patientId").notNull(),
  activityType: varchar("activityType", { length: 100 }).notNull(),
  frequencyPerWeek: int("frequencyPerWeek"),
  period: mysqlEnum("period", ["manha", "tarde", "noite"]),
  intensity: mysqlEnum("intensity", ["leve", "moderada", "intensa"]),
  durationMinutes: int("durationMinutes"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PhysicalActivityDetail = typeof physicalActivityDetails.$inferSelect;

// ─── POLYPHARMACY RULES ──────────────────────────────────────
export const polypharmacyRules = mysqlTable("polypharmacy_rules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  medicationA: varchar("medicationA", { length: 255 }).notNull(),
  medicationB: varchar("medicationB", { length: 255 }),
  interactionType: mysqlEnum("interactionType", ["contraindicacao", "precaucao", "monitorar", "limiar_polifarmacia"]).notNull(),
  description: text("description").notNull(),
  threshold: int("threshold"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PolypharmacyRule = typeof polypharmacyRules.$inferSelect;

// ─── TEAM QUEUE (fila da equipe) ─────────────────────────────
export const teamQueue = mysqlTable("team_queue", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  assignedProfile: mysqlEnum("assignedProfile", ["enfermagem", "medico_assistente", "supervisor", "nao_atribuido"]).default("nao_atribuido").notNull(),
  assignedToId: int("assignedToId"),
  priority: mysqlEnum("priority", ["baixa", "normal", "alta", "urgente"]).default("normal").notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  source: varchar("source", { length: 100 }),
  status: mysqlEnum("status", ["pendente", "em_atendimento", "concluido"]).default("pendente").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TeamQueueItem = typeof teamQueue.$inferSelect;

// ─── PROTOCOL DOCUMENTS (PDF gerado) ─────────────────────────
export const protocolDocuments = mysqlTable("protocol_documents", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  sessionId: int("sessionId"),
  documentType: mysqlEnum("documentType", ["protocolo", "anamnese", "relatorio"]).default("protocolo").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  fileUrl: text("fileUrl"),
  fileKey: varchar("fileKey", { length: 255 }),
  scoreBand: varchar("scoreBand", { length: 50 }),
  score: int("score"),
  signedByName: varchar("signedByName", { length: 255 }),
  signedByCRM: varchar("signedByCRM", { length: 50 }),
  signedAt: timestamp("signedAt"),
  sentVia: mysqlEnum("sentVia", ["whatsapp", "email", "nenhum"]).default("nenhum"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ProtocolDocument = typeof protocolDocuments.$inferSelect;

// ─── CLINICS (multi-tenancy) ────────────────────────────────
export const clinics = mysqlTable("clinics", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  logoUrl: text("logoUrl"),
  primaryColor: varchar("primaryColor", { length: 20 }).default("#10553C"),
  secondaryColor: varchar("secondaryColor", { length: 20 }).default("#D4AF37"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  cnpj: varchar("cnpj", { length: 20 }),
  ownerUserId: int("ownerUserId").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  plan: mysqlEnum("plan", ["starter", "pro", "enterprise"]).default("starter").notNull(),
  maxPatients: int("maxPatients").default(50),
  maxConsultants: int("maxConsultants").default(3),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Clinic = typeof clinics.$inferSelect;
export type InsertClinic = typeof clinics.$inferInsert;
