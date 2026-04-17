import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { FileHeart, Sun, Sunset, Moon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function RelatosDiarios() {
  const { data: patients } = trpc.patient.list.useQuery();
  const createReport = trpc.dailyReport.create.useMutation();
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [form, setForm] = useState({
    reportDate: new Date().toISOString().split("T")[0],
    period: "" as string,
    sleep: 5, energy: 5, mood: 5, focus: 5, concentration: 5, libido: 5, strength: 5, physicalActivity: 5,
    systolicBP: "", diastolicBP: "", weight: "", generalNotes: "",
  });

  const { data: reports } = trpc.dailyReport.list.useQuery(
    { patientId: Number(selectedPatient), limit: 20 },
    { enabled: !!selectedPatient }
  );

  const handleSubmit = async () => {
    if (!selectedPatient) { toast.error("Selecione um paciente"); return; }
    if (!form.period) { toast.error("Selecione o período"); return; }
    try {
      await createReport.mutateAsync({
        patientId: Number(selectedPatient),
        reportDate: form.reportDate,
        period: form.period as any,
        sleep: String(form.sleep), energy: String(form.energy), mood: String(form.mood),
        focus: String(form.focus), concentration: String(form.concentration), libido: String(form.libido),
        strength: String(form.strength), physicalActivity: String(form.physicalActivity),
        systolicBP: form.systolicBP ? Number(form.systolicBP) : undefined,
        diastolicBP: form.diastolicBP ? Number(form.diastolicBP) : undefined,
        weight: form.weight || undefined,
        generalNotes: form.generalNotes || undefined,
      });
      toast.success("Relato registrado com sucesso!");
    } catch (e: any) { toast.error(e.message); }
  };

  const periodIcon = { manha: Sun, tarde: Sunset, noite: Moon };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileHeart className="h-6 w-6 text-primary" /> Relatos Diários
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Via 3 — Registro de sintomas diários com seletor de período</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Novo Relato</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Paciente</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{(patients ?? []).map((p: any) => (<SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={form.reportDate} onChange={e => setForm(f => ({ ...f, reportDate: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Período</Label>
                  <div className="flex gap-2">
                    {(["manha", "tarde", "noite"] as const).map(p => {
                      const Icon = periodIcon[p];
                      return (
                        <Button key={p} variant={form.period === p ? "default" : "outline"} size="sm" className="flex-1 gap-1 text-xs"
                          onClick={() => setForm(f => ({ ...f, period: p }))}>
                          <Icon className="h-3.5 w-3.5" />
                          {p === "manha" ? "Manhã" : p === "tarde" ? "Tarde" : "Noite"}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "sleep", label: "Sono" }, { key: "energy", label: "Energia" },
                  { key: "mood", label: "Humor" }, { key: "focus", label: "Foco" },
                  { key: "concentration", label: "Concentração" }, { key: "libido", label: "Libido" },
                  { key: "strength", label: "Força" }, { key: "physicalActivity", label: "Atividade Física" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between"><Label className="text-xs">{label}</Label><span className="text-xs font-semibold text-primary">{(form as any)[key]}</span></div>
                    <Slider value={[(form as any)[key]]} min={0} max={10} step={0.5} onValueChange={([v]) => setForm(f => ({ ...f, [key]: v }))} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2"><Label className="text-xs">PA Sistólica</Label><Input type="number" value={form.systolicBP} onChange={e => setForm(f => ({ ...f, systolicBP: e.target.value }))} placeholder="120" /></div>
                <div className="space-y-2"><Label className="text-xs">PA Diastólica</Label><Input type="number" value={form.diastolicBP} onChange={e => setForm(f => ({ ...f, diastolicBP: e.target.value }))} placeholder="80" /></div>
                <div className="space-y-2"><Label className="text-xs">Peso (kg)</Label><Input value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="75.0" /></div>
              </div>

              <div className="space-y-2"><Label className="text-xs">Observações Gerais</Label><Textarea value={form.generalNotes} onChange={e => setForm(f => ({ ...f, generalNotes: e.target.value }))} rows={2} /></div>
              <Button onClick={handleSubmit} className="w-full" disabled={createReport.isPending}>{createReport.isPending ? "Salvando..." : "Registrar Relato"}</Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle className="text-base">Histórico Recente</CardTitle></CardHeader>
            <CardContent>
              {!selectedPatient ? (
                <p className="text-sm text-muted-foreground text-center py-4">Selecione um paciente</p>
              ) : !reports?.length ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum relato</p>
              ) : (
                <div className="space-y-2">
                  {reports.map((r: any) => (
                    <div key={r.id} className="p-3 rounded-lg border text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{r.reportDate}</span>
                        <Badge variant="outline" className="text-[10px]">{r.period === "manha" ? "Manhã" : r.period === "tarde" ? "Tarde" : "Noite"}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                        {r.sleep && <span>Sono: {r.sleep}</span>}
                        {r.energy && <span>Energia: {r.energy}</span>}
                        {r.focus && <span>Foco: {r.focus}</span>}
                        {r.libido && <span>Libido: {r.libido}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
