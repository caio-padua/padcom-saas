import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FileText, Send, Plus, Loader2, MessageSquare, Mail, CheckCircle, AlertTriangle, ShieldAlert, Eye } from "lucide-react";

export default function Protocolos() {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [form, setForm] = useState({ title: "", documentType: "protocolo" as string, scoreBand: "", score: "", signedByName: "", signedByCRM: "" });

  const patients = trpc.patient.list.useQuery();
  const docs = trpc.protocolDocument.list.useQuery({ patientId: selectedPatientId ?? 0 }, { enabled: !!selectedPatientId });
  const flags = trpc.clinicalFlag.list.useQuery({ patientId: selectedPatientId ?? 0 }, { enabled: !!selectedPatientId });
  const createMut = trpc.protocolDocument.create.useMutation({
    onSuccess: () => { docs.refetch(); setDialogOpen(false); toast.success("Protocolo criado"); },
    onError: (err) => { toast.error(err.message); },
  });
  const sendMut = trpc.protocolDocument.markSent.useMutation({
    onSuccess: () => { docs.refetch(); toast.success("Marcado como enviado"); },
  });

  const selectedPatient = (patients.data ?? []).find((p: any) => p.id === selectedPatientId);
  const pendingFlags = (flags.data ?? []).filter((f: any) => f.status === "pendente");
  const hasBlockingFlags = pendingFlags.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Protocolos e Documentos</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestão de protocolos clínicos, relatórios e envio ao paciente</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedPatientId?.toString() ?? ""} onValueChange={v => setSelectedPatientId(Number(v))}>
          <SelectTrigger className="w-[320px]"><SelectValue placeholder="Selecione um paciente" /></SelectTrigger>
          <SelectContent>
            {(patients.data ?? []).map((p: any) => (
              <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedPatientId && (
          <div className="flex items-center gap-2">
            {/* Preview button - always available */}
            <Button variant="outline" onClick={() => setPreviewOpen(true)}>
              <Eye className="h-4 w-4 mr-1" /> Preview Clínico
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={hasBlockingFlags}>
                  <Plus className="h-4 w-4 mr-1" /> Novo Protocolo
                  {hasBlockingFlags && <ShieldAlert className="h-4 w-4 ml-1 text-amber-300" />}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Criar Protocolo</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Título do documento" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  <Select value={form.documentType} onValueChange={v => setForm(f => ({ ...f, documentType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="protocolo">Protocolo</SelectItem>
                      <SelectItem value="anamnese">Anamnese</SelectItem>
                      <SelectItem value="relatorio">Relatório</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Faixa de score" value={form.scoreBand} onChange={e => setForm(f => ({ ...f, scoreBand: e.target.value }))} />
                    <Input type="number" placeholder="Score" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Assinado por (nome)" value={form.signedByName} onChange={e => setForm(f => ({ ...f, signedByName: e.target.value }))} />
                    <Input placeholder="CRM" value={form.signedByCRM} onChange={e => setForm(f => ({ ...f, signedByCRM: e.target.value }))} />
                  </div>
                  <Button className="w-full" disabled={!form.title || createMut.isPending} onClick={() => {
                    createMut.mutate({
                      patientId: selectedPatientId!, title: form.title,
                      documentType: form.documentType as any,
                      scoreBand: form.scoreBand || undefined,
                      score: form.score ? Number(form.score) : undefined,
                      signedByName: form.signedByName || undefined,
                      signedByCRM: form.signedByCRM || undefined,
                    });
                  }}>
                    {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Protocolo"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Blocking flags warning */}
      {selectedPatientId && hasBlockingFlags && (
        <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Protocolo bloqueado — {pendingFlags.length} flag(s) clínica(s) pendente(s)
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  É necessário validar todas as flags clínicas antes de criar um novo protocolo. Acesse a página de Flags Clínicas para resolver.
                </p>
                <div className="mt-2 space-y-1">
                  {pendingFlags.map((f: any) => (
                    <div key={f.id} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-amber-800 dark:text-amber-200">{f.flagType}: {f.description}</span>
                      <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-700">pendente</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Clínico Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Preview Clínico — {selectedPatient?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Flags Section */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" /> Flags Clínicas
              </h4>
              {(flags.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma flag registrada</p>
              ) : (
                <div className="space-y-1">
                  {(flags.data ?? []).map((f: any) => (
                    <div key={f.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                      <div className="flex items-center gap-2">
                        {f.status === "pendente" ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                        )}
                        <span>{f.flagType}: {f.description}</span>
                      </div>
                      <Badge variant={f.status === "pendente" ? "destructive" : "secondary"} className="text-[10px]">{f.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Existing Protocols */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> Protocolos Existentes
              </h4>
              {(docs.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum protocolo registrado</p>
              ) : (
                <div className="space-y-1">
                  {(docs.data ?? []).map((d: any) => (
                    <div key={d.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                      <span>{d.title}</span>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px] capitalize">{d.documentType}</Badge>
                        {d.sentVia && d.sentVia !== "nenhum" && <Badge className="text-[10px] bg-green-100 text-green-700">Enviado</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm font-medium">Resumo</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                <div>Flags pendentes: <span className={pendingFlags.length > 0 ? "text-amber-600 font-medium" : "text-green-600 font-medium"}>{pendingFlags.length}</span></div>
                <div>Flags validadas: <span className="font-medium">{(flags.data ?? []).filter((f: any) => f.status === "validado").length}</span></div>
                <div>Protocolos: <span className="font-medium">{(docs.data ?? []).length}</span></div>
                <div>Enviados: <span className="font-medium">{(docs.data ?? []).filter((d: any) => d.sentVia && d.sentVia !== "nenhum").length}</span></div>
              </div>
              {hasBlockingFlags && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Criação de protocolo bloqueada até validação das flags
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {!selectedPatientId ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">Selecione um paciente para ver os protocolos</CardContent></Card>
      ) : docs.isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (docs.data ?? []).length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">Nenhum protocolo registrado para este paciente</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {(docs.data ?? []).map((doc: any) => (
            <Card key={doc.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-medium">{doc.title}</span>
                      <Badge variant="outline" className="text-xs capitalize">{doc.documentType}</Badge>
                      {doc.scoreBand && <Badge className="bg-primary/10 text-primary text-xs">{doc.scoreBand}</Badge>}
                      {doc.score != null && <Badge variant="secondary" className="text-xs">Score: {doc.score}</Badge>}
                    </div>
                    {doc.signedByName && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Assinado por {doc.signedByName} {doc.signedByCRM ? `(CRM ${doc.signedByCRM})` : ""}
                        {doc.signedAt && ` em ${new Date(doc.signedAt).toLocaleDateString("pt-BR")}`}
                      </p>
                    )}
                    {doc.sentVia && doc.sentVia !== "nenhum" && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        {doc.sentVia === "whatsapp" ? <MessageSquare className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                        Enviado via {doc.sentVia} em {doc.sentAt ? new Date(doc.sentAt).toLocaleDateString("pt-BR") : ""}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground">{new Date(doc.createdAt).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="flex gap-1">
                    {(!doc.sentVia || doc.sentVia === "nenhum") && selectedPatient?.phone && (
                      <Button size="sm" variant="outline" onClick={() => {
                        const phone = selectedPatient.phone?.replace(/\D/g, "");
                        const msg = encodeURIComponent(`Olá ${selectedPatient.name}, segue seu protocolo: ${doc.title}. Acesse o portal para mais detalhes.`);
                        window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
                        sendMut.mutate({ id: doc.id, sentVia: "whatsapp" });
                      }}>
                        <MessageSquare className="h-3.5 w-3.5 mr-1" /> WhatsApp
                      </Button>
                    )}
                    {(!doc.sentVia || doc.sentVia === "nenhum") && (
                      <Button size="sm" variant="outline" onClick={() => sendMut.mutate({ id: doc.id, sentVia: "email" })}>
                        <Mail className="h-3.5 w-3.5 mr-1" /> Email
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
