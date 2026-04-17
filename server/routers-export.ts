/**
 * V11 — Export Router: CSV/Excel export for all major entities
 * Alias Núcleo: exportacao_dados
 */
import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

const entityEnum = z.enum([
  "patients", "leads", "prescriptions", "dispatches", "alerts",
  "consultants", "pharmacies", "validations", "sessions", "exams",
]);

function toCsvRow(obj: Record<string, any>, headers: string[]): string {
  return headers.map(h => {
    const val = obj[h];
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }).join(",");
}

function buildCsv(rows: Record<string, any>[], headers?: string[]): string {
  if (!rows.length) return "";
  const cols = headers ?? Object.keys(rows[0]);
  const headerRow = cols.join(",");
  const dataRows = rows.map(r => toCsvRow(r, cols));
  return [headerRow, ...dataRows].join("\n");
}

// Translate column headers to PT-BR
const headerTranslations: Record<string, string> = {
  id: "ID", name: "Nome", cpf: "CPF", email: "Email", phone: "Telefone",
  birthDate: "Data Nascimento", gender: "Gênero", address: "Endereço",
  status: "Status", createdAt: "Criado Em", updatedAt: "Atualizado Em",
  channelType: "Canal de Entrada", utmSource: "UTM Source", utmMedium: "UTM Medium",
  utmCampaign: "UTM Campaign", notes: "Observações", clinicId: "ID Clínica",
  patientId: "ID Paciente", totalValue: "Valor Total", commissionValue: "Valor Comissão",
  pharmacyId: "ID Farmácia", prescriptionId: "ID Prescrição",
  severity: "Severidade", type: "Tipo", message: "Mensagem",
  specialization: "Especialização", role: "Função",
  entityType: "Tipo Entidade", step: "Etapa", professionalName: "Nome Profissional",
  professionalCRM: "CRM", score: "Score", completedAt: "Concluído Em",
  entryChannel: "Canal Entrada", origemCanal: "Origem Canal",
};

function translateHeaders(rows: Record<string, any>[]): { translatedRows: Record<string, any>[], headers: string[] } {
  if (!rows.length) return { translatedRows: [], headers: [] };
  const originalKeys = Object.keys(rows[0]);
  const headers = originalKeys.map(k => headerTranslations[k] || k);
  const translatedRows = rows.map(r => {
    const newRow: Record<string, any> = {};
    originalKeys.forEach((k, i) => { newRow[headers[i]] = r[k]; });
    return newRow;
  });
  return { translatedRows, headers };
}

export const exportRouter = router({
  csv: protectedProcedure
    .input(z.object({
      entity: entityEnum,
      clinicId: z.number().optional(),
      limit: z.number().max(10000).optional(),
      filters: z.record(z.string(), z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const { entity, clinicId, limit } = input;
      let rows: Record<string, any>[] = [];

      switch (entity) {
        case "patients":
          rows = await db.listPatients(limit, clinicId);
          break;
        case "leads":
          rows = await db.listEntryLeads({ clinicId, limit });
          break;
        case "prescriptions":
          rows = await db.listPrescriptions(0, clinicId); // 0 = all patients
          break;
        case "dispatches":
          rows = await db.listDispatches({ clinicId });
          break;
        case "alerts":
          rows = await db.listAlerts(limit, clinicId);
          break;
        case "consultants":
          rows = await db.listConsultants(clinicId);
          break;
        case "pharmacies":
          rows = await db.listPharmacies(clinicId);
          break;
        case "validations":
          rows = await db.listValidationCascade({ clinicId });
          break;
        case "sessions":
          rows = await db.listSessions(0); // 0 = all patients
          break;
        case "exams":
          rows = await db.listExams(0); // 0 = all patients
          break;
        default:
          throw new TRPCError({ code: "BAD_REQUEST", message: `Entidade não suportada: ${entity}` });
      }

      // Flatten any nested objects for CSV
      const flatRows = rows.map(r => {
        const flat: Record<string, any> = {};
        for (const [k, v] of Object.entries(r)) {
          if (v instanceof Date) {
            flat[k] = v.toISOString();
          } else if (typeof v === "object" && v !== null) {
            flat[k] = JSON.stringify(v);
          } else {
            flat[k] = v;
          }
        }
        return flat;
      });

      const { translatedRows, headers } = translateHeaders(flatRows);
      const csv = buildCsv(translatedRows, headers);

      return {
        csv,
        filename: `${entity}_export_${new Date().toISOString().slice(0, 10)}.csv`,
        rowCount: rows.length,
        entity,
      };
    }),

  // Summary stats for export preview
  preview: protectedProcedure
    .input(z.object({
      entity: entityEnum,
      clinicId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { entity, clinicId } = input;
      let count = 0;
      try {
        switch (entity) {
          case "patients": count = (await db.listPatients(undefined, clinicId)).length; break;
          case "leads": count = (await db.listEntryLeads({ clinicId })).length; break;
          case "prescriptions": count = (await db.listPrescriptions(0, clinicId)).length; break;
          case "dispatches": count = (await db.listDispatches({ clinicId })).length; break;
          case "alerts": count = (await db.listAlerts(undefined, clinicId)).length; break;
          case "consultants": count = (await db.listConsultants(clinicId)).length; break;
          case "pharmacies": count = (await db.listPharmacies(clinicId)).length; break;
          case "validations": count = (await db.listValidationCascade({ clinicId })).length; break;
          case "sessions": count = (await db.listSessions(0)).length; break;
          case "exams": count = (await db.listExams(0)).length; break;
        }
      } catch { count = 0; }
      return { entity, count };
    }),
});
