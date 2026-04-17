import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Copy, MessageSquare, Stethoscope, Sparkles, FileHeart, Pill, FlaskConical, CalendarCheck, Bell } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

export default function PacienteDetalhe() {
  const params = useParams<{ id: string }>();
  const patientId = Number(params.id);
  const [, setLocation] = useLocation();
  const { data: patient, isLoading } = trpc.patient.get.useQuery({ id: patientId });
  const { data: prescriptions } = trpc.prescription.list.useQuery({ patientId });
  const { data: dailyReports } = trpc.dailyReport.list.useQuery({ patientId, limit: 10 });
  const { data: examsData } = trpc.exam.list.useQuery({ patientId });
  const { data: sessions } = trpc.followUp.list.useQuery({ patientId });
  const { data: alertsData } = trpc.alert.list.useQuery({ patientId });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  if (!patient) return <div className="p-8 text-center text-muted-foreground">Paciente não encontrado</div>;

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/portal/${patient.accessToken}`);
    toast.success("Link copiado!");
  };

  const sendWhatsApp = () => {
    const url = `${window.location.origin}/portal/${patient.accessToken}`;
    const msg = encodeURIComponent(`Olá ${patient.name}! Segue o link para preencher sua anamnese e relatos no PADCOM: ${url}`);
    const phone = patient.phone?.replace(/\D/g, "") ?? "";
    window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
  };

  const activePrescriptions = (prescriptions ?? []).filter((p: any) => p.status === "ativa");
  const activeAlerts = (alertsData ?? []).filter((a: any) => a.status === "ativo");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/pacientes")}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{patient.name}</h1>
          <p className="text-sm text-muted-foreground">{patient.cpf} {patient.birthDate ? `| Nasc: ${patient.birthDate}` : ""} {patient.sex ? `| ${patient.sex === "M" ? "Masculino" : patient.sex === "F" ? "Feminino" : "Outro"}` : ""}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={copyLink}><Copy className="h-3.5 w-3.5" /> Link</Button>
          {patient.phone && <Button variant="outline" size="sm" className="gap-1.5 text-green-600" onClick={sendWhatsApp}><MessageSquare className="h-3.5 w-3.5" /> WhatsApp</Button>}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat icon={Pill} label="Fórmulas Ativas" value={activePrescriptions.length} />
        <MiniStat icon={FileHeart} label="Relatos" value={dailyReports?.length ?? 0} />
        <MiniStat icon={FlaskConical} label="Exames" value={examsData?.length ?? 0} />
        <MiniStat icon={Bell} label="Alertas" value={activeAlerts.length} color={activeAlerts.length > 0 ? "text-orange-600" : undefined} />
      </div>

      <Tabs defaultValue="prescricoes" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-10">
          <TabsTrigger value="prescricoes" className="text-xs">Prescrições</TabsTrigger>
          <TabsTrigger value="relatos" className="text-xs">Relatos</TabsTrigger>
          <TabsTrigger value="exames" className="text-xs">Exames</TabsTrigger>
          <TabsTrigger value="sessoes" className="text-xs">Sessões</TabsTrigger>
          <TabsTrigger value="alertas" className="text-xs">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="prescricoes" className="mt-4">
          {activePrescriptions.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhuma prescrição ativa</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {activePrescriptions.map((p: any) => (
                <Card key={p.id}><CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.code} | {p.dosage} | {p.frequency}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{p.status}</Badge>
                </CardContent></Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="relatos" className="mt-4">
          {!dailyReports?.length ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhum relato registrado</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {dailyReports.map((r: any) => (
                <Card key={r.id}><CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{r.reportDate}</p>
                    <Badge variant="outline" className="text-xs">{r.period === "manha" ? "Manhã" : r.period === "tarde" ? "Tarde" : "Noite"}</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {r.sleep && <div><span className="text-muted-foreground">Sono:</span> {r.sleep}</div>}
                    {r.energy && <div><span className="text-muted-foreground">Energia:</span> {r.energy}</div>}
                    {r.focus && <div><span className="text-muted-foreground">Foco:</span> {r.focus}</div>}
                    {r.libido && <div><span className="text-muted-foreground">Libido:</span> {r.libido}</div>}
                  </div>
                </CardContent></Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="exames" className="mt-4">
          {!examsData?.length ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhum exame registrado</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {examsData.map((e: any) => (
                <Card key={e.id}><CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{e.examName}</p>
                    <p className="text-xs text-muted-foreground">{e.examDate} | {e.value} {e.unit} (Ref: {e.referenceMin}-{e.referenceMax})</p>
                  </div>
                  {e.classification && <Badge variant="outline" className="text-xs">{e.classification}</Badge>}
                </CardContent></Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sessoes" className="mt-4">
          {!sessions?.length ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhuma sessão registrada</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {sessions.map((s: any) => (
                <Card key={s.id}><CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{new Date(s.sessionDate).toLocaleDateString("pt-BR")}</p>
                    <p className="text-xs text-muted-foreground">{s.sessionType} | Score: {s.clinicalScore ?? "N/A"}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{s.status}</Badge>
                </CardContent></Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alertas" className="mt-4">
          {!alertsData?.length ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhum alerta</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {alertsData.map((a: any) => (
                <Card key={a.id}><CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.category} | {new Date(a.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${a.priority === "critica" ? "bg-red-500/10 text-red-700" : a.priority === "alta" ? "bg-orange-500/10 text-orange-700" : ""}`}>{a.priority}</Badge>
                </CardContent></Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color?: string }) {
  return (
    <Card><CardContent className="p-4 flex items-center gap-3">
      <Icon className={`h-5 w-5 ${color ?? "text-primary"}`} />
      <div><p className="text-lg font-bold">{value}</p><p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p></div>
    </CardContent></Card>
  );
}
