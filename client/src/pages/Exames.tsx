import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ExamesPage() {
  const { data: patients } = trpc.patient.list.useQuery();
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const { data: exams } = trpc.exam.list.useQuery({ patientId: Number(selectedPatient) }, { enabled: !!selectedPatient });
  const createMutation = trpc.exam.create.useMutation();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ examName: "", value: "", unit: "", referenceMin: "", referenceMax: "", classification: "", examDate: new Date().toISOString().split("T")[0], notes: "" });

  const handleCreate = async () => {
    if (!selectedPatient || !form.examName) { toast.error("Preencha os campos obrigatórios"); return; }
    try {
      await createMutation.mutateAsync({ patientId: Number(selectedPatient), ...form });
      toast.success("Exame registrado!");
      utils.exam.list.invalidate();
      setOpen(false);
      setForm({ examName: "", value: "", unit: "", referenceMin: "", referenceMax: "", classification: "", examDate: new Date().toISOString().split("T")[0], notes: "" });
    } catch (e: any) { toast.error(e.message); }
  };

  const classColor: Record<string, string> = { OTIMO: "bg-green-500/10 text-green-700", MEDIANO: "bg-yellow-500/10 text-yellow-700", BAIXO: "bg-red-500/10 text-red-700" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><FlaskConical className="h-6 w-6 text-primary" /> Exames</h1>
          <p className="text-sm text-muted-foreground mt-1">Registro e acompanhamento de exames laboratoriais</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2" disabled={!selectedPatient}><Plus className="h-4 w-4" /> Novo Exame</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Exame</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Nome do Exame *</Label><Input value={form.examName} onChange={e => setForm(f => ({ ...f, examName: e.target.value }))} placeholder="GGT, TSH, etc." /></div>
                <div className="space-y-2"><Label>Data *</Label><Input type="date" value={form.examDate} onChange={e => setForm(f => ({ ...f, examDate: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2"><Label>Valor</Label><Input value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Unidade</Label><Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Classificação</Label><Input value={form.classification} onChange={e => setForm(f => ({ ...f, classification: e.target.value }))} placeholder="OTIMO" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Ref. Mín.</Label><Input value={form.referenceMin} onChange={e => setForm(f => ({ ...f, referenceMin: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Ref. Máx.</Label><Input value={form.referenceMax} onChange={e => setForm(f => ({ ...f, referenceMax: e.target.value }))} /></div>
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={createMutation.isPending}>Registrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="max-w-xs"><Select value={selectedPatient} onValueChange={setSelectedPatient}><SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger><SelectContent>{(patients ?? []).map((p: any) => (<SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>))}</SelectContent></Select></div>
      {!selectedPatient ? <Card><CardContent className="p-12 text-center text-muted-foreground">Selecione um paciente</CardContent></Card> : !exams?.length ? <Card><CardContent className="p-12 text-center text-muted-foreground">Nenhum exame</CardContent></Card> : (
        <div className="space-y-2">{exams.map((e: any) => (
          <Card key={e.id}><CardContent className="p-4 flex items-center justify-between">
            <div><p className="font-medium text-sm">{e.examName}</p><p className="text-xs text-muted-foreground">{e.examDate} | {e.value} {e.unit} (Ref: {e.referenceMin}-{e.referenceMax})</p></div>
            {e.classification && <Badge variant="outline" className={`text-xs ${classColor[e.classification] ?? ""}`}>{e.classification}</Badge>}
          </CardContent></Card>
        ))}</div>
      )}
    </div>
  );
}
