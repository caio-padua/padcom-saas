import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Phone, Mail, Copy, MessageSquare } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Pacientes() {
  const { data: patients, isLoading } = trpc.patient.list.useQuery();
  const createMutation = trpc.patient.create.useMutation();
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", cpf: "", birthDate: "", sex: "" as string, phone: "", email: "" });

  const filtered = useMemo(() => {
    if (!patients) return [];
    const s = search.toLowerCase();
    return patients.filter((p: any) => p.name.toLowerCase().includes(s) || p.cpf?.includes(s) || p.email?.toLowerCase().includes(s));
  }, [patients, search]);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    try {
      const result = await createMutation.mutateAsync({
        ...form,
        sex: (form.sex || undefined) as any,
      });
      toast.success("Paciente cadastrado com sucesso");
      utils.patient.list.invalidate();
      setOpen(false);
      setForm({ name: "", cpf: "", birthDate: "", sex: "", phone: "", email: "" });
    } catch (e: any) {
      toast.error(e.message || "Erro ao cadastrar");
    }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/portal/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  const sendWhatsApp = (phone: string, token: string, name: string) => {
    const url = `${window.location.origin}/portal/${token}`;
    const msg = encodeURIComponent(`Olá ${name}! Segue o link para preencher sua anamnese e relatos no PADCOM: ${url}`);
    const whatsPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/55${whatsPhone}?text=${msg}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie seus pacientes e gere links de acesso</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Paciente</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Cadastrar Paciente</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Nome Completo *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome do paciente" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>CPF</Label><Input value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" /></div>
                <div className="space-y-2"><Label>Data Nasc.</Label><Input type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Sexo</Label>
                  <Select value={form.sex} onValueChange={v => setForm(f => ({ ...f, sex: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="O">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Telefone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(00) 00000-0000" /></div>
              </div>
              <div className="space-y-2"><Label>E-mail</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" /></div>
              <Button onClick={handleCreate} className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Cadastrando..." : "Cadastrar Paciente"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome, CPF ou email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-20 bg-muted animate-pulse rounded" /></CardContent></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><p className="text-muted-foreground">Nenhum paciente encontrado</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p: any) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="cursor-pointer flex-1" onClick={() => setLocation(`/pacientes/${p.id}`)}>
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{p.name}</h3>
                    {p.cpf && <p className="text-xs text-muted-foreground mt-0.5">{p.cpf}</p>}
                  </div>
                  <Badge variant={p.isActive ? "default" : "secondary"} className="text-[10px]">
                    {p.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {p.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{p.phone}</div>}
                  {p.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{p.email}</div>}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => copyLink(p.accessToken)}>
                    <Copy className="h-3 w-3" /> Link
                  </Button>
                  {p.phone && (
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-green-600 hover:text-green-700" onClick={() => sendWhatsApp(p.phone, p.accessToken, p.name)}>
                      <MessageSquare className="h-3 w-3" /> WhatsApp
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-7 text-xs ml-auto" onClick={() => setLocation(`/pacientes/${p.id}`)}>
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
