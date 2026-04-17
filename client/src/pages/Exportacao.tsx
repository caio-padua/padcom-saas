import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, FileSpreadsheet, Users, ShoppingCart, AlertTriangle, Pill, Building2, ShieldCheck, ClipboardList, Microscope, UserCheck } from "lucide-react";

const ENTITIES = [
  { value: "patients", label: "Pacientes", icon: Users, description: "Dados cadastrais de todos os pacientes" },
  { value: "leads", label: "Leads de Entrada", icon: ShoppingCart, description: "Leads capturados por todos os braços de entrada (E1-E6)" },
  { value: "prescriptions", label: "Prescrições", icon: Pill, description: "Prescrições médicas com componentes e status" },
  { value: "dispatches", label: "Despachos Farmácia", icon: Building2, description: "Despachos de prescrição para farmácias parceiras" },
  { value: "alerts", label: "Alertas Clínicos", icon: AlertTriangle, description: "Alertas gerados pelo motor clínico" },
  { value: "consultants", label: "Consultoras", icon: UserCheck, description: "Equipe de consultoras e profissionais" },
  { value: "pharmacies", label: "Farmácias Parceiras", icon: Building2, description: "Cadastro de farmácias parceiras" },
  { value: "validations", label: "Cascata de Validação", icon: ShieldCheck, description: "Registros da cascata de validação com certificados" },
  { value: "sessions", label: "Sessões de Anamnese", icon: ClipboardList, description: "Sessões de anamnese com scores e status" },
  { value: "exams", label: "Exames", icon: Microscope, description: "Exames laboratoriais e de imagem" },
] as const;

export default function Exportacao() {
  const [selectedEntity, setSelectedEntity] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  const preview = trpc.export.preview.useQuery(
    { entity: selectedEntity as any },
    { enabled: !!selectedEntity }
  );

  const exportCsv = trpc.export.csv.useMutation({
    onSuccess: (data) => {
      // Create and download CSV file
      const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
      const blob = new Blob([BOM + data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exportação concluída: ${data.rowCount} registros`);
      setIsExporting(false);
    },
    onError: (err) => {
      toast.error(`Erro na exportação: ${err.message}`);
      setIsExporting(false);
    },
  });

  const handleExport = () => {
    if (!selectedEntity) {
      toast.error("Selecione uma entidade para exportar");
      return;
    }
    setIsExporting(true);
    exportCsv.mutate({ entity: selectedEntity as any });
  };

  const selectedInfo = ENTITIES.find(e => e.value === selectedEntity);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
          Exportação de Dados
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Exporte dados do sistema em formato CSV compatível com Excel, Google Sheets e outros softwares de planilha.
        </p>
      </div>

      {/* Entity Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Selecionar Entidade</CardTitle>
          <CardDescription>
            Escolha qual conjunto de dados deseja exportar. O arquivo CSV será gerado com cabeçalhos em português.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedEntity} onValueChange={setSelectedEntity}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a entidade para exportar..." />
            </SelectTrigger>
            <SelectContent>
              {ENTITIES.map(e => (
                <SelectItem key={e.value} value={e.value}>
                  <span className="flex items-center gap-2">
                    <e.icon className="h-4 w-4" />
                    {e.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedInfo && (
            <div className="rounded-lg border p-4 bg-muted/30 space-y-3">
              <div className="flex items-center gap-2">
                <selectedInfo.icon className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold">{selectedInfo.label}</span>
                {preview.data && (
                  <Badge variant="secondary">{preview.data.count} registros</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{selectedInfo.description}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleExport}
              disabled={!selectedEntity || isExporting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isExporting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Entities Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Entidades Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ENTITIES.map(e => (
            <Card
              key={e.value}
              className={`cursor-pointer transition-all hover:shadow-md ${selectedEntity === e.value ? "ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" : ""}`}
              onClick={() => setSelectedEntity(e.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${selectedEntity === e.value ? "bg-emerald-100 dark:bg-emerald-900" : "bg-muted"}`}>
                    <e.icon className={`h-5 w-5 ${selectedEntity === e.value ? "text-emerald-600" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{e.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{e.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Info */}
      <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-1">Informações sobre a exportação</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• O arquivo CSV é gerado com codificação UTF-8 BOM para compatibilidade com Excel</li>
            <li>• Cabeçalhos são traduzidos para português automaticamente</li>
            <li>• Campos de data são formatados em ISO 8601 (AAAA-MM-DD)</li>
            <li>• Campos JSON são serializados como texto para preservar estrutura</li>
            <li>• Limite máximo de 10.000 registros por exportação</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
