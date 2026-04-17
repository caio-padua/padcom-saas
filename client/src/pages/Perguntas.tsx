import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PerguntasPage() {
  const [category, setCategory] = useState<string>("integrativa");
  const { data: questions, isLoading } = trpc.question.list.useQuery({ category: category as any });
  const createMutation = trpc.question.create.useMutation();
  const updateMutation = trpc.question.update.useMutation();
  const deleteMutation = trpc.question.delete.useMutation();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    questionText: "", section: "", fieldType: "text" as string, isRequired: false,
    options: "", scaleMin: "0", scaleMax: "10", sortOrder: "0",
  });

  const resetForm = () => {
    setForm({ questionText: "", section: "", fieldType: "text", isRequired: false, options: "", scaleMin: "0", scaleMax: "10", sortOrder: "0" });
    setEditId(null);
  };

  const handleSave = async () => {
    if (!form.questionText || !form.section) { toast.error("Preencha texto e seção"); return; }
    const payload = {
      questionText: form.questionText,
      section: form.section,
      fieldType: form.fieldType as any,
      category: category as any,
      isRequired: form.isRequired,
      options: form.options ? form.options.split(",").map(s => s.trim()) : undefined,
      scaleMin: form.fieldType === "scale" ? Number(form.scaleMin) : undefined,
      scaleMax: form.fieldType === "scale" ? Number(form.scaleMax) : undefined,
      sortOrder: Number(form.sortOrder),
    };
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, ...payload });
        toast.success("Pergunta atualizada!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Pergunta criada!");
      }
      utils.question.list.invalidate();
      setOpen(false);
      resetForm();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleEdit = (q: any) => {
    setEditId(q.id);
    setForm({
      questionText: q.questionText, section: q.section, fieldType: q.fieldType,
      isRequired: q.isRequired, options: (q.options ?? []).join(", "),
      scaleMin: String(q.scaleMin ?? 0), scaleMax: String(q.scaleMax ?? 10), sortOrder: String(q.sortOrder ?? 0),
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir esta pergunta?")) return;
    await deleteMutation.mutateAsync({ id });
    utils.question.list.invalidate();
    toast.success("Pergunta excluída");
  };

  const toggleActive = async (id: number, current: boolean) => {
    await updateMutation.mutateAsync({ id, isActive: !current });
    utils.question.list.invalidate();
  };

  const sections = Array.from(new Set((questions ?? []).map((q: any) => q.section)));

  const fieldTypeLabel: Record<string, string> = {
    text: "Texto", textarea: "Texto Longo", number: "Número", date: "Data",
    scale: "Escala", select: "Seleção", multiselect: "Multi-Seleção", checkbox: "Checkbox",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ClipboardList className="h-6 w-6 text-primary" /> Perguntas da Anamnese</h1>
          <p className="text-sm text-muted-foreground mt-1">CRUD completo — gerencie perguntas diretamente pelo dashboard</p>
        </div>
        <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Nova Pergunta</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>{editId ? "Editar Pergunta" : "Nova Pergunta"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Texto da Pergunta *</Label><Input value={form.questionText} onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))} placeholder="Qual é a sua queixa principal?" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Seção *</Label><Input value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} placeholder="Dados Pessoais" /></div>
                <div className="space-y-2"><Label>Tipo de Campo</Label>
                  <Select value={form.fieldType} onValueChange={v => setForm(f => ({ ...f, fieldType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(fieldTypeLabel).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              {(form.fieldType === "select" || form.fieldType === "multiselect") && (
                <div className="space-y-2"><Label>Opções (separadas por vírgula)</Label><Input value={form.options} onChange={e => setForm(f => ({ ...f, options: e.target.value }))} placeholder="Opção 1, Opção 2, Opção 3" /></div>
              )}
              {form.fieldType === "scale" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Mínimo</Label><Input type="number" value={form.scaleMin} onChange={e => setForm(f => ({ ...f, scaleMin: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Máximo</Label><Input type="number" value={form.scaleMax} onChange={e => setForm(f => ({ ...f, scaleMax: e.target.value }))} /></div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} /></div>
                <div className="flex items-center gap-2 pt-6"><Switch checked={form.isRequired} onCheckedChange={v => setForm(f => ({ ...f, isRequired: v }))} /><Label>Obrigatória</Label></div>
              </div>
              <Button onClick={handleSave} className="w-full">{editId ? "Atualizar" : "Criar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList>
          <TabsTrigger value="integrativa">Integrativa</TabsTrigger>
          <TabsTrigger value="estetica">Estética</TabsTrigger>
          <TabsTrigger value="relato_diario">Relato Diário</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? <div className="text-center p-8 text-muted-foreground">Carregando...</div> : !questions?.length ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">Nenhuma pergunta cadastrada nesta categoria</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {sections.map(sec => (
            <div key={sec}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{sec}</h3>
              <div className="space-y-1">
                {(questions ?? []).filter((q: any) => q.section === sec).sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((q: any) => (
                  <Card key={q.id} className={`${!q.isActive ? "opacity-50" : ""}`}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{q.questionText}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px]">{fieldTypeLabel[q.fieldType] ?? q.fieldType}</Badge>
                          {q.isRequired && <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-600">Obrigatória</Badge>}
                        </div>
                      </div>
                      <Switch checked={q.isActive} onCheckedChange={() => toggleActive(q.id, q.isActive)} />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(q)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(q.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
