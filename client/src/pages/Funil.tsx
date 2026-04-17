import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Users } from "lucide-react";

const stageLabels: Record<string, string> = {
  iniciou_e_parou: "Iniciou e Parou",
  concluiu_clinico: "Concluiu Clínico",
  concluiu_financeiro: "Concluiu Financeiro",
  alto_interesse: "Alto Interesse",
  convertido: "Convertido",
};

const stageColors: Record<string, string> = {
  iniciou_e_parou: "#ef4444",
  concluiu_clinico: "#f59e0b",
  concluiu_financeiro: "#3b82f6",
  alto_interesse: "#8b5cf6",
  convertido: "#22c55e",
};

export default function FunilPage() {
  const stats = trpc.funnel.stats.useQuery();

  const chartData = Object.keys(stageLabels).map(stage => ({
    stage,
    label: stageLabels[stage],
    count: stats.data?.find((s: any) => s.stage === stage)?.count ?? 0,
    color: stageColors[stage],
  }));

  const total = chartData.reduce((a, b) => a + b.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Funil Comercial</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão consolidada do funil de conversão de pacientes</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {chartData.map(item => (
          <Card key={item.stage}>
            <CardContent className="py-4 text-center">
              <div className="text-3xl font-bold" style={{ color: item.color }}>{item.count}</div>
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              {total > 0 && <p className="text-xs text-muted-foreground">{Math.round((item.count / total) * 100)}%</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Distribuição do Funil</CardTitle></CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" />
                <YAxis dataKey="label" type="category" width={150} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Resumo</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{total}</div>
              <p className="text-sm text-muted-foreground">Total no funil</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{chartData.find(c => c.stage === "convertido")?.count ?? 0}</div>
              <p className="text-sm text-muted-foreground">Convertidos</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">
                {total > 0 ? Math.round(((chartData.find(c => c.stage === "convertido")?.count ?? 0) / total) * 100) : 0}%
              </div>
              <p className="text-sm text-muted-foreground">Taxa de conversão</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
