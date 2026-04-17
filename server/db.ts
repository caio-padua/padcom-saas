import { eq, desc, and, sql, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, patients, consultants, anamnesisQuestions,
  anamnesisSessions, anamnesisResponses, prescriptions, prescriptionComponents,
  dailyReports, prescriptionReports, alerts, alertRules, followUpSessions,
  exams, auditLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (e) { console.warn("[DB] Failed:", e); _db = null; }
  }
  return _db;
}

// ─── USER HELPERS ──────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  (["name", "email", "loginMethod"] as const).forEach(f => {
    const v = user[f]; if (v === undefined) return;
    (values as any)[f] = v ?? null; updateSet[f] = v ?? null;
  });
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return r[0] ?? undefined;
}

// ─── PATIENT HELPERS ───────────────────────────────────────────
export async function listPatients(createdById?: number) {
  const db = await getDb(); if (!db) return [];
  if (createdById) return db.select().from(patients).where(eq(patients.createdById, createdById)).orderBy(desc(patients.createdAt));
  return db.select().from(patients).orderBy(desc(patients.createdAt));
}

export async function getPatient(id: number) {
  const db = await getDb(); if (!db) return undefined;
  const r = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return r[0] ?? undefined;
}

export async function getPatientByToken(token: string) {
  const db = await getDb(); if (!db) return undefined;
  const r = await db.select().from(patients).where(eq(patients.accessToken, token)).limit(1);
  return r[0] ?? undefined;
}

export async function createPatient(data: any) {
  const db = await getDb(); if (!db) return null;
  const result = await db.insert(patients).values(data);
  return result[0].insertId;
}

export async function updatePatient(id: number, data: any) {
  const db = await getDb(); if (!db) return;
  await db.update(patients).set(data).where(eq(patients.id, id));
}

// ─── CONSULTANT HELPERS ────────────────────────────────────────
export async function listConsultants() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(consultants).orderBy(desc(consultants.createdAt));
}

export async function createConsultant(data: any) {
  const db = await getDb(); if (!db) return null;
  const r = await db.insert(consultants).values(data);
  return r[0].insertId;
}

export async function updateConsultant(id: number, data: any) {
  const db = await getDb(); if (!db) return;
  await db.update(consultants).set(data).where(eq(consultants.id, id));
}

export async function deleteConsultant(id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(consultants).where(eq(consultants.id, id));
}

// ─── ANAMNESIS QUESTION HELPERS ────────────────────────────────
export async function listQuestions(category?: "integrativa" | "estetica") {
  const db = await getDb(); if (!db) return [];
  if (category) return db.select().from(anamnesisQuestions).where(eq(anamnesisQuestions.category, category)).orderBy(asc(anamnesisQuestions.sortOrder));
  return db.select().from(anamnesisQuestions).orderBy(asc(anamnesisQuestions.sortOrder));
}

export async function createQuestion(data: any) {
  const db = await getDb(); if (!db) return null;
  const r = await db.insert(anamnesisQuestions).values(data);
  return r[0].insertId;
}

export async function updateQuestion(id: number, data: any) {
  const db = await getDb(); if (!db) return;
  await db.update(anamnesisQuestions).set(data).where(eq(anamnesisQuestions.id, id));
}

export async function deleteQuestion(id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(anamnesisQuestions).where(eq(anamnesisQuestions.id, id));
}

// ─── ANAMNESIS SESSION HELPERS ─────────────────────────────────
export async function listSessions(patientId: number, category?: "integrativa" | "estetica") {
  const db = await getDb(); if (!db) return [];
  const conditions = [eq(anamnesisSessions.patientId, patientId)];
  if (category) conditions.push(eq(anamnesisSessions.category, category));
  return db.select().from(anamnesisSessions).where(and(...conditions)).orderBy(desc(anamnesisSessions.createdAt));
}

export async function createSession(data: any) {
  const db = await getDb(); if (!db) return null;
  const r = await db.insert(anamnesisSessions).values(data);
  return r[0].insertId;
}

export async function updateSession(id: number, data: any) {
  const db = await getDb(); if (!db) return;
  await db.update(anamnesisSessions).set(data).where(eq(anamnesisSessions.id, id));
}

// ─── ANAMNESIS RESPONSE HELPERS ────────────────────────────────
export async function getResponses(sessionId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(anamnesisResponses).where(eq(anamnesisResponses.sessionId, sessionId));
}

export async function saveResponses(sessionId: number, responses: any[]) {
  const db = await getDb(); if (!db) return;
  // Delete existing and re-insert
  await db.delete(anamnesisResponses).where(eq(anamnesisResponses.sessionId, sessionId));
  if (responses.length > 0) {
    await db.insert(anamnesisResponses).values(responses.map(r => ({ ...r, sessionId })));
  }
}

// ─── PRESCRIPTION HELPERS ──────────────────────────────────────
export async function listPrescriptions(patientId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(prescriptions).where(eq(prescriptions.patientId, patientId)).orderBy(desc(prescriptions.createdAt));
}

export async function createPrescription(data: any) {
  const db = await getDb(); if (!db) return null;
  const r = await db.insert(prescriptions).values(data);
  return r[0].insertId;
}

export async function updatePrescription(id: number, data: any) {
  const db = await getDb(); if (!db) return;
  await db.update(prescriptions).set(data).where(eq(prescriptions.id, id));
}

export async function getPrescriptionComponents(prescriptionId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(prescriptionComponents).where(eq(prescriptionComponents.prescriptionId, prescriptionId)).orderBy(asc(prescriptionComponents.sortOrder));
}

export async function savePrescriptionComponents(prescriptionId: number, components: any[]) {
  const db = await getDb(); if (!db) return;
  await db.delete(prescriptionComponents).where(eq(prescriptionComponents.prescriptionId, prescriptionId));
  if (components.length > 0) {
    await db.insert(prescriptionComponents).values(components.map((c, i) => ({ ...c, prescriptionId, sortOrder: i })));
  }
}

// ─── DAILY REPORT HELPERS ──────────────────────────────────────
export async function listDailyReports(patientId: number, limit = 30) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(dailyReports).where(eq(dailyReports.patientId, patientId)).orderBy(desc(dailyReports.reportDate)).limit(limit);
}

export async function createDailyReport(data: any) {
  const db = await getDb(); if (!db) return null;
  const r = await db.insert(dailyReports).values(data);
  return r[0].insertId;
}

// ─── PRESCRIPTION REPORT HELPERS ───────────────────────────────
export async function listPrescriptionReports(patientId?: number) {
  const db = await getDb(); if (!db) return [];
  if (patientId) return db.select().from(prescriptionReports).where(eq(prescriptionReports.patientId, patientId)).orderBy(desc(prescriptionReports.reportedAt));
  return db.select().from(prescriptionReports).orderBy(desc(prescriptionReports.reportedAt));
}

export async function createPrescriptionReport(data: any) {
  const db = await getDb(); if (!db) return null;
  const r = await db.insert(prescriptionReports).values(data);
  return r[0].insertId;
}

export async function updatePrescriptionReport(id: number, data: any) {
  const db = await getDb(); if (!db) return;
  await db.update(prescriptionReports).set(data).where(eq(prescriptionReports.id, id));
}

// ─── ALERT HELPERS ─────────────────────────────────────────────
export async function listAlerts(patientId?: number) {
  const db = await getDb(); if (!db) return [];
  if (patientId) return db.select().from(alerts).where(eq(alerts.patientId, patientId)).orderBy(desc(alerts.createdAt));
  return db.select().from(alerts).orderBy(desc(alerts.createdAt));
}

export async function createAlert(data: any) {
  const db = await getDb(); if (!db) return null;
  const r = await db.insert(alerts).values(data);
  return r[0].insertId;
}

export async function updateAlert(id: number, data: any) {
  const db = await getDb(); if (!db) return;
  await db.update(alerts).set(data).where(eq(alerts.id, id));
}

export async function listAlertRules() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(alertRules).orderBy(desc(alertRules.createdAt));
}

export async function createAlertRule(data: any) {
  const db = await getDb(); if (!db) return null;
  const r = await db.insert(alertRules).values(data);
  return r[0].insertId;
}

export async function updateAlertRule(id: number, data: any) {
  const db = await getDb(); if (!db) return;
  await db.update(alertRules).set(data).where(eq(alertRules.id, id));
}

// ─── EXAM HELPERS ──────────────────────────────────────────────
export async function listExams(patientId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(exams).where(eq(exams.patientId, patientId)).orderBy(desc(exams.examDate));
}

export async function createExam(data: any) {
  const db = await getDb(); if (!db) return null;
  const r = await db.insert(exams).values(data);
  return r[0].insertId;
}

export async function updateExam(id: number, data: any) {
  const db = await getDb(); if (!db) return;
  await db.update(exams).set(data).where(eq(exams.id, id));
}

// ─── FOLLOW-UP SESSION HELPERS ─────────────────────────────────
export async function listFollowUpSessions(patientId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(followUpSessions).where(eq(followUpSessions.patientId, patientId)).orderBy(desc(followUpSessions.sessionDate));
}

export async function createFollowUpSession(data: any) {
  const db = await getDb(); if (!db) return null;
  const r = await db.insert(followUpSessions).values(data);
  return r[0].insertId;
}

export async function updateFollowUpSession(id: number, data: any) {
  const db = await getDb(); if (!db) return;
  await db.update(followUpSessions).set(data).where(eq(followUpSessions.id, id));
}

// ─── AUDIT LOG HELPERS ─────────────────────────────────────────
export async function logAudit(data: { userId?: number; action: string; entity: string; entityId?: number; details?: any; ipAddress?: string }) {
  const db = await getDb(); if (!db) return;
  await db.insert(auditLog).values(data);
}

export async function listAuditLogs(limit = 100) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(limit);
}

// ─── DASHBOARD STATS ───────────────────────────────────────────
export async function getDashboardStats(userId: number) {
  const db = await getDb(); if (!db) return null;
  const [patientCount] = await db.select({ count: sql<number>`count(*)` }).from(patients);
  const [alertCount] = await db.select({ count: sql<number>`count(*)` }).from(alerts).where(eq(alerts.status, "ativo"));
  const [reportCount] = await db.select({ count: sql<number>`count(*)` }).from(prescriptionReports).where(eq(prescriptionReports.status, "aberto"));
  const [consultantCount] = await db.select({ count: sql<number>`count(*)` }).from(consultants).where(eq(consultants.isActive, true));
  return {
    totalPatients: patientCount?.count ?? 0,
    activeAlerts: alertCount?.count ?? 0,
    openReports: reportCount?.count ?? 0,
    activeConsultants: consultantCount?.count ?? 0,
  };
}
