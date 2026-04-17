import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao administrador" });
  return next({ ctx });
});

// ─── PATIENT ROUTER ────────────────────────────────────────────
const patientRouter = router({
  list: protectedProcedure.query(async () => db.listPatients()),
  get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => db.getPatient(input.id)),
  getByToken: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => db.getPatientByToken(input.token)),
  create: protectedProcedure.input(z.object({
    name: z.string().min(1), cpf: z.string().optional(), birthDate: z.string().optional(),
    sex: z.enum(["M", "F", "O"]).optional(), phone: z.string().optional(),
    email: z.string().optional(), notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const token = nanoid(32);
    const id = await db.createPatient({ ...input, accessToken: token, createdById: ctx.user.id });
    await db.logAudit({ userId: ctx.user.id, action: "create", entity: "patient", entityId: id ?? undefined });
    return { id, accessToken: token };
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(), name: z.string().optional(), cpf: z.string().optional(),
    birthDate: z.string().optional(), sex: z.enum(["M", "F", "O"]).optional(),
    phone: z.string().optional(), email: z.string().optional(),
    notes: z.string().optional(), isActive: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    await db.updatePatient(id, data);
    await db.logAudit({ userId: ctx.user.id, action: "update", entity: "patient", entityId: id });
  }),
});

// ─── CONSULTANT ROUTER ─────────────────────────────────────────
const consultantRouter = router({
  list: protectedProcedure.query(async () => db.listConsultants()),
  create: adminProcedure.input(z.object({
    name: z.string().min(1), role: z.enum(["enfermeira", "biomedica", "nutricionista", "esteticista", "outro"]), email: z.string().optional(),
    phone: z.string().optional(), canAccessIntegrative: z.boolean().optional(),
    canAccessAesthetic: z.boolean().optional(), canAccessReports: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    const id = await db.createConsultant(input);
    await db.logAudit({ userId: ctx.user.id, action: "create", entity: "consultant", entityId: id ?? undefined });
    return { id };
  }),
  update: adminProcedure.input(z.object({
    id: z.number(), name: z.string().optional(), role: z.string().optional(),
    email: z.string().optional(), phone: z.string().optional(),
    isActive: z.boolean().optional(), canAccessIntegrative: z.boolean().optional(),
    canAccessAesthetic: z.boolean().optional(), canAccessReports: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    await db.updateConsultant(id, data);
    await db.logAudit({ userId: ctx.user.id, action: "update", entity: "consultant", entityId: id });
  }),
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    await db.deleteConsultant(input.id);
    await db.logAudit({ userId: ctx.user.id, action: "delete", entity: "consultant", entityId: input.id });
  }),
});

// ─── ANAMNESIS QUESTION ROUTER ─────────────────────────────────
const questionRouter = router({
  list: protectedProcedure.input(z.object({ category: z.enum(["integrativa", "estetica", "relato_diario"]).optional() }).optional()).query(async ({ input }) => db.listQuestions(input?.category as any)),
  create: adminProcedure.input(z.object({
    category: z.enum(["integrativa", "estetica", "relato_diario"]), section: z.string().min(1),
    questionText: z.string().min(1), fieldType: z.enum(["text", "number", "scale", "select", "multiselect", "checkbox", "date", "textarea"]),
    options: z.any().optional(), scaleMin: z.number().optional(), scaleMax: z.number().optional(),
    isRequired: z.boolean().optional(), sortOrder: z.number().optional(),
  })).mutation(async ({ input, ctx }) => {
    const id = await db.createQuestion(input);
    await db.logAudit({ userId: ctx.user.id, action: "create", entity: "question", entityId: id ?? undefined });
    return { id };
  }),
  update: adminProcedure.input(z.object({
    id: z.number(), section: z.string().optional(), questionText: z.string().optional(),
    fieldType: z.enum(["text", "number", "scale", "select", "multiselect", "checkbox", "date", "textarea"]).optional(),
    options: z.any().optional(), scaleMin: z.number().optional(), scaleMax: z.number().optional(),
    isRequired: z.boolean().optional(), sortOrder: z.number().optional(), isActive: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    await db.updateQuestion(id, data);
    await db.logAudit({ userId: ctx.user.id, action: "update", entity: "question", entityId: id });
  }),
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    await db.deleteQuestion(input.id);
    await db.logAudit({ userId: ctx.user.id, action: "delete", entity: "question", entityId: input.id });
  }),
});

// ─── ANAMNESIS SESSION ROUTER ──────────────────────────────────
const anamnesisRouter = router({
  listSessions: protectedProcedure.input(z.object({ patientId: z.number(), category: z.enum(["integrativa", "estetica"]).optional() })).query(async ({ input }) => db.listSessions(input.patientId, input.category)),
  createSession: protectedProcedure.input(z.object({
    patientId: z.number(), category: z.enum(["integrativa", "estetica"]),
    conductedByType: z.enum(["medico", "consultora", "paciente"]).optional(),
  })).mutation(async ({ input, ctx }) => {
    const id = await db.createSession({ ...input, conductedById: ctx.user.id, status: "em_andamento" });
    return { id };
  }),
  getResponses: protectedProcedure.input(z.object({ sessionId: z.number() })).query(async ({ input }) => db.getResponses(input.sessionId)),
  saveResponses: protectedProcedure.input(z.object({
    sessionId: z.number(),
    responses: z.array(z.object({ questionId: z.number(), answerText: z.string().optional(), answerNumber: z.string().optional(), answerJson: z.any().optional() })),
  })).mutation(async ({ input }) => {
    await db.saveResponses(input.sessionId, input.responses);
  }),
  completeSession: protectedProcedure.input(z.object({ sessionId: z.number(), notes: z.string().optional() })).mutation(async ({ input }) => {
    await db.updateSession(input.sessionId, { status: "concluida", completedAt: new Date(), notes: input.notes });
  }),
  // Public endpoint for patient self-service
  createPatientSession: publicProcedure.input(z.object({
    token: z.string(), category: z.enum(["integrativa", "estetica"]),
  })).mutation(async ({ input }) => {
    const patient = await db.getPatientByToken(input.token);
    if (!patient) throw new TRPCError({ code: "NOT_FOUND", message: "Paciente não encontrado" });
    const id = await db.createSession({ patientId: patient.id, category: input.category, conductedByType: "paciente", status: "em_andamento" });
    return { id, patientId: patient.id };
  }),
  savePatientResponses: publicProcedure.input(z.object({
    token: z.string(), sessionId: z.number(),
    responses: z.array(z.object({ questionId: z.number(), answerText: z.string().optional(), answerNumber: z.string().optional(), answerJson: z.any().optional() })),
  })).mutation(async ({ input }) => {
    const patient = await db.getPatientByToken(input.token);
    if (!patient) throw new TRPCError({ code: "NOT_FOUND", message: "Paciente não encontrado" });
    await db.saveResponses(input.sessionId, input.responses);
    await db.updateSession(input.sessionId, { status: "concluida", completedAt: new Date() });
  }),
});

// ─── PRESCRIPTION ROUTER ───────────────────────────────────────
const prescriptionRouter = router({
  list: protectedProcedure.input(z.object({ patientId: z.number() })).query(async ({ input }) => db.listPrescriptions(input.patientId)),
  listByToken: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
    const patient = await db.getPatientByToken(input.token);
    if (!patient) throw new TRPCError({ code: "NOT_FOUND" });
    return db.listPrescriptions(patient.id);
  }),
  create: protectedProcedure.input(z.object({
    patientId: z.number(), code: z.string(), name: z.string(), via: z.string().optional(),
    form: z.string().optional(), dosage: z.string().optional(), frequency: z.string().optional(),
    duration: z.string().optional(), objective: z.string().optional(),
    components: z.array(z.object({ componentName: z.string(), dosage: z.string().optional(), unit: z.string().optional(), notes: z.string().optional() })).optional(),
  })).mutation(async ({ input, ctx }) => {
    const { components, ...prescData } = input;
    const id = await db.createPrescription(prescData);
    if (id && components?.length) await db.savePrescriptionComponents(id, components);
    await db.logAudit({ userId: ctx.user.id, action: "create", entity: "prescription", entityId: id ?? undefined });
    return { id };
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(), status: z.enum(["ativa", "pausada", "encerrada"]).optional(),
    name: z.string().optional(), dosage: z.string().optional(), frequency: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    await db.updatePrescription(id, data);
    await db.logAudit({ userId: ctx.user.id, action: "update", entity: "prescription", entityId: id });
  }),
  getComponents: protectedProcedure.input(z.object({ prescriptionId: z.number() })).query(async ({ input }) => db.getPrescriptionComponents(input.prescriptionId)),
});

// ─── DAILY REPORT ROUTER ───────────────────────────────────────
const dailyReportRouter = router({
  list: protectedProcedure.input(z.object({ patientId: z.number(), limit: z.number().optional() })).query(async ({ input }) => db.listDailyReports(input.patientId, input.limit)),
  create: publicProcedure.input(z.object({
    token: z.string().optional(), patientId: z.number().optional(),
    reportDate: z.string(), period: z.enum(["manha", "tarde", "noite"]),
    sleep: z.string().optional(), energy: z.string().optional(), mood: z.string().optional(),
    focus: z.string().optional(), concentration: z.string().optional(), libido: z.string().optional(),
    strength: z.string().optional(), physicalActivity: z.string().optional(),
    systolicBP: z.number().optional(), diastolicBP: z.number().optional(),
    weight: z.string().optional(), generalNotes: z.string().optional(),
  })).mutation(async ({ input }) => {
    let pId = input.patientId;
    if (input.token && !pId) {
      const patient = await db.getPatientByToken(input.token);
      if (!patient) throw new TRPCError({ code: "NOT_FOUND" });
      pId = patient.id;
    }
    if (!pId) throw new TRPCError({ code: "BAD_REQUEST", message: "Patient ID required" });
    const { token, ...data } = input;
    const id = await db.createDailyReport({ ...data, patientId: pId });
    return { id };
  }),
});

// ─── PRESCRIPTION REPORT ROUTER ────────────────────────────────
const prescriptionReportRouter = router({
  list: protectedProcedure.input(z.object({ patientId: z.number().optional() }).optional()).query(async ({ input }) => db.listPrescriptionReports(input?.patientId)),
  create: publicProcedure.input(z.object({
    token: z.string().optional(), patientId: z.number().optional(),
    prescriptionId: z.number(), reportType: z.enum(["reacao_adversa", "melhora", "sem_efeito", "duvida", "outro"]),
    severity: z.enum(["leve", "moderada", "grave"]).optional(), description: z.string().min(1),
  })).mutation(async ({ input }) => {
    let pId = input.patientId;
    if (input.token && !pId) {
      const patient = await db.getPatientByToken(input.token);
      if (!patient) throw new TRPCError({ code: "NOT_FOUND" });
      pId = patient.id;
    }
    if (!pId) throw new TRPCError({ code: "BAD_REQUEST" });
    const { token, ...data } = input;
    const id = await db.createPrescriptionReport({ ...data, patientId: pId });
    // Auto-create alert for adverse reactions
    if (input.reportType === "reacao_adversa") {
      await db.createAlert({
        patientId: pId, category: "Reação a Fórmula",
        priority: input.severity === "grave" ? "critica" : input.severity === "moderada" ? "alta" : "moderada",
        title: `Reação adversa reportada`, description: input.description,
        source: "prescription_report", sourceId: id,
      });
    }
    return { id };
  }),
  resolve: protectedProcedure.input(z.object({
    id: z.number(), resolutionNotes: z.string(),
  })).mutation(async ({ input, ctx }) => {
    await db.updatePrescriptionReport(input.id, { status: "resolvido", resolvedAt: new Date(), resolvedById: ctx.user.id, resolutionNotes: input.resolutionNotes });
  }),
});

// ─── ALERT ROUTER ──────────────────────────────────────────────
const alertRouter = router({
  list: protectedProcedure.input(z.object({ patientId: z.number().optional() }).optional()).query(async ({ input }) => db.listAlerts(input?.patientId)),
  update: protectedProcedure.input(z.object({
    id: z.number(), status: z.enum(["ativo", "em_analise", "resolvido", "descartado"]).optional(),
    assignedToId: z.number().optional(), resolutionNotes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    if (data.status === "resolvido") (data as any).resolvedAt = new Date();
    await db.updateAlert(id, data);
    await db.logAudit({ userId: ctx.user.id, action: "update", entity: "alert", entityId: id });
  }),
  rules: router({
    list: protectedProcedure.query(async () => db.listAlertRules()),
    create: adminProcedure.input(z.object({
      name: z.string(), source: z.string(), condition: z.string(),
      alertCategory: z.string(), alertPriority: z.enum(["baixa", "moderada", "alta", "critica"]).optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createAlertRule(input);
      return { id };
    }),
    update: adminProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateAlertRule(id, data);
    }),
  }),
});

// ─── EXAM ROUTER ───────────────────────────────────────────────
const examRouter = router({
  list: protectedProcedure.input(z.object({ patientId: z.number() })).query(async ({ input }) => db.listExams(input.patientId)),
  create: protectedProcedure.input(z.object({
    patientId: z.number(), examName: z.string().min(1), value: z.string().optional(),
    unit: z.string().optional(), referenceMin: z.string().optional(), referenceMax: z.string().optional(),
    classification: z.string().optional(), examDate: z.string(), notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const id = await db.createExam(input);
    await db.logAudit({ userId: ctx.user.id, action: "create", entity: "exam", entityId: id ?? undefined });
    // Auto-alert engine: check exam against reference ranges
    if (input.value && input.referenceMax) {
      const val = parseFloat(input.value);
      const max = parseFloat(input.referenceMax);
      const min = input.referenceMin ? parseFloat(input.referenceMin) : 0;
      if (!isNaN(val) && !isNaN(max) && val > max) {
        await db.createAlert({
          patientId: input.patientId, category: "Exame Alterado",
          priority: val > max * 1.5 ? "critica" : val > max * 1.2 ? "alta" : "moderada",
          title: `${input.examName} acima do limite (${input.value} ${input.unit ?? ""})`,
          description: `Valor: ${input.value}, Referência: ${input.referenceMin ?? "0"}-${input.referenceMax}`,
          source: "exam", sourceId: id,
        });
      } else if (!isNaN(val) && !isNaN(min) && val < min && min > 0) {
        await db.createAlert({
          patientId: input.patientId, category: "Exame Alterado",
          priority: "moderada",
          title: `${input.examName} abaixo do limite (${input.value} ${input.unit ?? ""})`,
          description: `Valor: ${input.value}, Referência: ${input.referenceMin}-${input.referenceMax}`,
          source: "exam", sourceId: id,
        });
      }
    }
    return { id };
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(), value: z.string().optional(), classification: z.string().optional(), notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    await db.updateExam(id, data);
  }),
});

// ─── FOLLOW-UP SESSION ROUTER ──────────────────────────────────
const followUpRouter = router({
  list: protectedProcedure.input(z.object({ patientId: z.number() })).query(async ({ input }) => db.listFollowUpSessions(input.patientId)),
  create: protectedProcedure.input(z.object({
    patientId: z.number(), sessionType: z.enum(["presencial", "online"]).optional(),
    sessionDate: z.string(), clinicalScore: z.string().optional(),
    scoreBreakdown: z.any().optional(), notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const id = await db.createFollowUpSession({ ...input, sessionDate: new Date(input.sessionDate), conductedById: ctx.user.id });
    return { id };
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(), status: z.enum(["agendada", "realizada", "cancelada"]).optional(),
    clinicalScore: z.string().optional(), scoreBreakdown: z.any().optional(), notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    await db.updateFollowUpSession(id, data);
  }),
});

// ─── DASHBOARD ROUTER ──────────────────────────────────────────
const dashboardRouter = router({
  stats: protectedProcedure.query(async ({ ctx }) => db.getDashboardStats(ctx.user.id)),
  auditLog: adminProcedure.input(z.object({ limit: z.number().optional() }).optional()).query(async ({ input }) => db.listAuditLogs(input?.limit)),
  patientTimeline: protectedProcedure.input(z.object({ patientId: z.number(), days: z.number().optional() })).query(async ({ input }) => {
    const days = input.days ?? 90;
    const reports = await db.listDailyReports(input.patientId, days);
    const exams = await db.listExams(input.patientId);
    const sessions = await db.listFollowUpSessions(input.patientId);
    // Build symptom evolution data
    const symptomData = (reports ?? []).map((r: any) => ({
      date: r.reportDate, period: r.period,
      sleep: r.sleep ? parseFloat(r.sleep) : null, energy: r.energy ? parseFloat(r.energy) : null,
      mood: r.mood ? parseFloat(r.mood) : null, focus: r.focus ? parseFloat(r.focus) : null,
      concentration: r.concentration ? parseFloat(r.concentration) : null, libido: r.libido ? parseFloat(r.libido) : null,
      strength: r.strength ? parseFloat(r.strength) : null, physicalActivity: r.physicalActivity ? parseFloat(r.physicalActivity) : null,
      systolicBP: r.systolicBP, diastolicBP: r.diastolicBP, weight: r.weight,
    }));
    // Build exam evolution data grouped by exam name
    const examGroups: Record<string, any[]> = {};
    (exams ?? []).forEach((e: any) => {
      if (!examGroups[e.examName]) examGroups[e.examName] = [];
      examGroups[e.examName].push({ date: e.examDate, value: e.value ? parseFloat(e.value) : null, unit: e.unit, refMin: e.referenceMin, refMax: e.referenceMax });
    });
    // Compute clinical score from latest reports
    const latestReports = (reports ?? []).slice(0, 7);
    let clinicalScore = null;
    if (latestReports.length > 0) {
      const axes = ["sleep", "energy", "mood", "focus", "concentration", "libido", "strength", "physicalActivity"];
      const scores: Record<string, number> = {};
      axes.forEach(axis => {
        const vals = latestReports.map((r: any) => r[axis] ? parseFloat(r[axis]) : null).filter((v: any): v is number => v !== null);
        scores[axis] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      });
      const total = Object.values(scores).reduce((a, b) => a + b, 0);
      clinicalScore = { axes: scores, total: Math.round((total / (axes.length * 10)) * 100) };
    }
    return { symptomData, examGroups, sessions, clinicalScore };
  }),
});

// ─── MAIN ROUTER ───────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  patient: patientRouter,
  consultant: consultantRouter,
  question: questionRouter,
  anamnesis: anamnesisRouter,
  prescription: prescriptionRouter,
  dailyReport: dailyReportRouter,
  prescriptionReport: prescriptionReportRouter,
  alert: alertRouter,
  exam: examRouter,
  followUp: followUpRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
