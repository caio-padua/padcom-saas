import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, Sun, Sunset, Moon, AlertTriangle, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useMemo } from "react";
import { useParams } from "wouter";
import { toast } from "sonner";

export default function PatientPortal() {
  const params = useParams<{ token: string; tab?: string }>();
  const token = params.token;
  const { data: patient, isLoading } = trpc.patient.getByToken.useQuery({ token }, { enabled: !!token });
  const [activeTab, setActiveTab] = useState(params.tab || "relato");

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Carregando...</div>
    </div>
  );

  if (!patient) return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="max-w-md w-full"><CardContent className="p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">Link Inválido</h2>
        <p className="text-sm text-muted-foreground">Este link de acesso não é válido ou expirou. Entre em contato com sua clínica.</p>
      </CardContent></Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <header className="bg-white/80 backdrop-blur border-b sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-primary">PADCOM</h1>
            <p className="text-[11px] text-muted-foreground">Olá, {patient.name?.split(" ")[0]}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="relato" className="text-xs">Relato Diário</TabsTrigger>
            <TabsTrigger value="prescricoes" className="text-xs">Minhas Fórmulas</TabsTrigger>
            <TabsTrigger value="anamnese" className="text-xs">Anamnese</TabsTrigger>
          </TabsList>

          <TabsContent value="relato"><DailyReportForm patientId={patient.id} /></TabsContent>
          <TabsContent value="prescricoes"><PrescriptionReports patientId={patient.id} /></TabsContent>
          <TabsContent value="anamnese"><PatientAnamnese patientId={patient.id} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function DailyReportForm({ patientId }: { patientId: number }) {
  const createReport = trpc.dailyReport.create.useMutation();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    reportDate: new Date().toISOString().split("T")[0],
    period: "" as string,
    sleep: 5, energy: 5, mood: 5, focus: 5, concentration: 5, libido: 5, strength: 5, physicalActivity: 5,
    systolicBP: "", diastolicBP: "", weight: "", generalNotes: "",
  });

  const handleSubmit = async () => {
    if (!form.period) { toast.error("Selecione o período do dia"); return; }
    try {
      await createReport.mutateAsync({
        patientId,
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
      setSubmitted(true);
      toast.success("Relato enviado com sucesso!");
    } catch (e: any) { toast.error(e.message); }
  };

  if (submitted) return (
    <Card><CardContent className="p-8 text-center">
      <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
      <h2 className="text-lg font-semibold mb-2">Relato Enviado!</h2>
      <p className="text-sm text-muted-foreground mb-4">Seu relato diário foi registrado com sucesso.</p>
      <Button onClick={() => setSubmitted(false)}>Enviar Outro Relato</Button>
    </CardContent></Card>
  );

  const periodIcon = { manha: Sun, tarde: Sunset, noite: Moon };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Relato Diário</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label className="text-xs">Data</Label><Input type="date" value={form.reportDate} onChange={e => setForm(f => ({ ...f, reportDate: e.target.value }))} /></div>
          <div className="space-y-2">
            <Label className="text-xs">Período</Label>
            <div className="flex gap-1.5">
              {(["manha", "tarde", "noite"] as const).map(p => {
                const Icon = periodIcon[p];
                return (
                  <Button key={p} variant={form.period === p ? "default" : "outline"} size="sm" className="flex-1 gap-1 text-[11px] h-9"
                    onClick={() => setForm(f => ({ ...f, period: p }))}>
                    <Icon className="h-3.5 w-3.5" />
                    {p === "manha" ? "Manhã" : p === "tarde" ? "Tarde" : "Noite"}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { key: "sleep", label: "Sono" }, { key: "energy", label: "Energia" },
            { key: "mood", label: "Humor" }, { key: "focus", label: "Foco" },
            { key: "concentration", label: "Concentração" }, { key: "libido", label: "Libido" },
            { key: "strength", label: "Força" }, { key: "physicalActivity", label: "Atividade Física" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <div className="flex justify-between"><Label className="text-xs">{label}</Label><span className="text-xs font-bold text-primary">{(form as any)[key]}</span></div>
              <Slider value={[(form as any)[key]]} min={0} max={10} step={0.5} onValueChange={([v]) => setForm(f => ({ ...f, [key]: v }))} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1"><Label className="text-[10px]">PA Sist.</Label><Input type="number" value={form.systolicBP} onChange={e => setForm(f => ({ ...f, systolicBP: e.target.value }))} placeholder="120" className="h-9 text-sm" /></div>
          <div className="space-y-1"><Label className="text-[10px]">PA Diast.</Label><Input type="number" value={form.diastolicBP} onChange={e => setForm(f => ({ ...f, diastolicBP: e.target.value }))} placeholder="80" className="h-9 text-sm" /></div>
          <div className="space-y-1"><Label className="text-[10px]">Peso (kg)</Label><Input value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="75" className="h-9 text-sm" /></div>
        </div>

        <div className="space-y-1"><Label className="text-xs">Observações</Label><Textarea value={form.generalNotes} onChange={e => setForm(f => ({ ...f, generalNotes: e.target.value }))} rows={2} placeholder="Como você está se sentindo hoje?" /></div>
        <Button onClick={handleSubmit} className="w-full" disabled={createReport.isPending}>{createReport.isPending ? "Enviando..." : "Enviar Relato"}</Button>
      </CardContent>
    </Card>
  );
}

function PrescriptionReports({ patientId }: { patientId: number }) {
  const { data: prescriptions } = trpc.prescription.list.useQuery({ patientId });
  const createReport = trpc.prescriptionReport.create.useMutation();
  const [selectedPrescription, setSelectedPrescription] = useState<number | null>(null);
  const [reportForm, setReportForm] = useState({ reportType: "reacao_adversa" as string, severity: "leve" as string, description: "" });
  const [submitted, setSubmitted] = useState(false);

  const activePrescriptions = (prescriptions ?? []).filter((p: any) => p.status === "ativa");

  const handleReport = async () => {
    if (!selectedPrescription || !reportForm.description) { toast.error("Selecione a fórmula e descreva o ocorrido"); return; }
    try {
      await createReport.mutateAsync({
        prescriptionId: selectedPrescription,
        patientId,
        reportType: reportForm.reportType as any,
        severity: reportForm.severity as any,
        description: reportForm.description,
      });
      setSubmitted(true);
      toast.success("Relato enviado! A equipe será notificada.");
    } catch (e: any) { toast.error(e.message); }
  };

  if (submitted) return (
    <Card><CardContent className="p-8 text-center">
      <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
      <h2 className="text-lg font-semibold mb-2">Relato Enviado!</h2>
      <p className="text-sm text-muted-foreground mb-4">A equipe médica será notificada sobre sua experiência.</p>
      <Button onClick={() => { setSubmitted(false); setSelectedPrescription(null); setReportForm({ reportType: "reacao_adversa", severity: "leve", description: "" }); }}>Enviar Outro Relato</Button>
    </CardContent></Card>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Suas Fórmulas Ativas</CardTitle></CardHeader>
        <CardContent>
          {activePrescriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma fórmula ativa no momento</p>
          ) : (
            <div className="space-y-2">
              {activePrescriptions.map((p: any) => (
                <button key={p.id}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${selectedPrescription === p.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-accent/30"}`}
                  onClick={() => setSelectedPrescription(p.id)}>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.code} | {p.dosage} | {p.frequency}</p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPrescription && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" /> Reportar Experiência</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-xs">Tipo</Label>
                <Select value={reportForm.reportType} onValueChange={v => setReportForm(f => ({ ...f, reportType: v }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reacao_adversa">Reação Adversa</SelectItem>
                    <SelectItem value="melhora">Melhora</SelectItem>
                    <SelectItem value="sem_efeito">Sem Efeito</SelectItem>
                    <SelectItem value="duvida">Dúvida</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-xs">Gravidade</Label>
                <Select value={reportForm.severity} onValueChange={v => setReportForm(f => ({ ...f, severity: v }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leve">Leve</SelectItem>
                    <SelectItem value="moderada">Moderada</SelectItem>
                    <SelectItem value="grave">Grave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label className="text-xs">Descreva o que ocorreu</Label><Textarea value={reportForm.description} onChange={e => setReportForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Ex: Senti queimação no estômago após a 2ª tomada..." /></div>
            <Button onClick={handleReport} className="w-full" disabled={createReport.isPending}>{createReport.isPending ? "Enviando..." : "Enviar Relato"}</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PatientAnamnese({ patientId }: { patientId: number }) {
  const { data: questions } = trpc.question.list.useQuery({ category: "integrativa" });
  const createSession = trpc.anamnesis.createSession.useMutation();
  const saveResponses = trpc.anamnesis.saveResponses.useMutation();
  const completeSession = trpc.anamnesis.completeSession.useMutation();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [completed, setCompleted] = useState(false);

  const sections = useMemo(() => {
    if (!questions) return [];
    const secs: Record<string, any[]> = {};
    questions.forEach((q: any) => { if (!q.isActive) return; if (!secs[q.section]) secs[q.section] = []; secs[q.section].push(q); });
    return Object.entries(secs).map(([name, qs]) => ({ name, questions: qs }));
  }, [questions]);

  const startSession = async () => {
    try {
      const result = await createSession.mutateAsync({ patientId, category: "integrativa", conductedByType: "paciente" });
      setSessionId(result.id);
      setCurrentStep(0);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleComplete = async () => {
    if (!sessionId) return;
    try {
      const responses = Object.entries(answers).map(([qId, val]) => ({
        questionId: Number(qId),
        answerText: typeof val === "string" ? val : undefined,
        answerNumber: typeof val === "number" ? String(val) : undefined,
        answerJson: typeof val === "object" ? val : undefined,
      }));
      await saveResponses.mutateAsync({ sessionId, responses });
      await completeSession.mutateAsync({ sessionId });
      setCompleted(true);
      toast.success("Anamnese concluída!");
    } catch (e: any) { toast.error(e.message); }
  };

  if (completed) return (
    <Card><CardContent className="p-8 text-center">
      <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
      <h2 className="text-lg font-semibold mb-2">Anamnese Concluída!</h2>
      <p className="text-sm text-muted-foreground">Obrigado por preencher. O médico terá acesso às suas respostas.</p>
    </CardContent></Card>
  );

  if (!sessionId) return (
    <Card>
      <CardContent className="p-8 text-center">
        <Stethoscope className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">Anamnese Clínica</h2>
        <p className="text-sm text-muted-foreground mb-4">Preencha o questionário para que o médico tenha acesso ao seu histórico de saúde.</p>
        {sections.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum questionário disponível no momento.</p>
        ) : (
          <Button onClick={startSession} disabled={createSession.isPending}>Iniciar Anamnese</Button>
        )}
      </CardContent>
    </Card>
  );

  const currentSection = sections[currentStep];
  const progress = sections.length > 0 ? ((currentStep + 1) / sections.length) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Seção {currentStep + 1}/{sections.length}: {currentSection?.name}</p>
        <Badge variant="outline" className="text-xs">{Math.round(progress)}%</Badge>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
      <Card><CardContent className="p-5 space-y-5">
        {currentSection?.questions.map((q: any) => (
          <PortalQuestionField key={q.id} question={q} value={answers[q.id]} onChange={(v: any) => setAnswers(prev => ({ ...prev, [q.id]: v }))} />
        ))}
      </CardContent></Card>
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 0} className="gap-1"><ChevronLeft className="h-4 w-4" /> Anterior</Button>
        {currentStep === sections.length - 1 ? (
          <Button onClick={handleComplete} className="gap-1" disabled={saveResponses.isPending}><Check className="h-4 w-4" /> Concluir</Button>
        ) : (
          <Button onClick={() => setCurrentStep(s => s + 1)} className="gap-1">Próxima <ChevronRight className="h-4 w-4" /></Button>
        )}
      </div>
    </div>
  );
}

function PortalQuestionField({ question, value, onChange }: { question: any; value: any; onChange: (v: any) => void }) {
  const q = question;
  return (
    <div className="space-y-2">
      <Label className="text-sm">{q.questionText} {q.isRequired && <span className="text-destructive">*</span>}</Label>
      {q.fieldType === "text" && <Input value={value ?? ""} onChange={e => onChange(e.target.value)} />}
      {q.fieldType === "textarea" && <Textarea value={value ?? ""} onChange={e => onChange(e.target.value)} rows={3} />}
      {q.fieldType === "number" && <Input type="number" value={value ?? ""} onChange={e => onChange(Number(e.target.value))} />}
      {q.fieldType === "date" && <Input type="date" value={value ?? ""} onChange={e => onChange(e.target.value)} />}
      {q.fieldType === "scale" && (
        <div className="space-y-1.5">
          <Slider value={[value ?? q.scaleMin ?? 0]} min={q.scaleMin ?? 0} max={q.scaleMax ?? 10} step={0.5} onValueChange={([v]) => onChange(v)} />
          <div className="flex justify-between text-xs text-muted-foreground"><span>{q.scaleMin ?? 0}</span><span className="font-bold text-foreground">{value ?? 0}</span><span>{q.scaleMax ?? 10}</span></div>
        </div>
      )}
      {q.fieldType === "select" && (
        <Select value={value ?? ""} onValueChange={onChange}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>{(q.options ?? []).map((opt: string, i: number) => (<SelectItem key={i} value={opt}>{opt}</SelectItem>))}</SelectContent>
        </Select>
      )}
      {q.fieldType === "multiselect" && (
        <div className="space-y-2">{(q.options ?? []).map((opt: string, i: number) => {
          const selected = Array.isArray(value) ? value : [];
          return (<div key={i} className="flex items-center gap-2"><Checkbox checked={selected.includes(opt)} onCheckedChange={checked => { onChange(checked ? [...selected, opt] : selected.filter((s: string) => s !== opt)); }} /><span className="text-sm">{opt}</span></div>);
        })}</div>
      )}
      {q.fieldType === "checkbox" && (<div className="flex items-center gap-2"><Checkbox checked={!!value} onCheckedChange={onChange} /><span className="text-sm">Sim</span></div>)}
    </div>
  );
}
