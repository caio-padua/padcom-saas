import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bell, FileWarning, UserCog, Activity, Stethoscope } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: alerts } = trpc.alert.list.useQuery();
  const { data: reports } = trpc.prescriptionReport.list.useQuery();
  const [, setLocation] = useLocation();

  const recentAlerts = (alerts ?? []).filter((a: any) => a.status === "ativo").slice(0, 5);
  const openReports = (reports ?? []).filter((r: any) => r.status === "aberto").slice(0, 5);

  const priorityColor: Record<string, string> = {
    critica: "bg-red-500/10 text-red-700 border-red-200",
    alta: "bg-orange-500/10 text-orange-700 border-orange-200",
    moderada: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
    baixa: "bg-blue-500/10 text-blue-700 border-blue-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PADCOM GLOBAL</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Bem-vindo, Dr. {user?.name?.split(" ")[0] ?? ""}. Visão consolidada do sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-normal gap-1.5 py-1">
            <Activity className="h-3 w-3" />
            Sistema Ativo
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))
        ) : (
          <>
            <StatCard icon={Users} label="Pacientes" value={stats?.totalPatients ?? 0} color="text-primary" onClick={() => setLocation("/pacientes")} />
            <StatCard icon={Bell} label="Alertas Ativos" value={stats?.activeAlerts ?? 0} color="text-orange-600" onClick={() => setLocation("/alertas")} />
            <StatCard icon={FileWarning} label="Relatos Abertos" value={stats?.openReports ?? 0} color="text-red-600" onClick={() => setLocation("/relatos-diarios")} />
            <StatCard icon={UserCog} label="Consultoras Ativas" value={stats?.activeConsultants ?? 0} color="text-emerald-600" onClick={() => setLocation("/consultoras")} />
          </>
        )}
      </div>

      {/* Alerts & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-orange-500" />
              Alertas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhum alerta ativo</p>
            ) : (
              <div className="space-y-2">
                {recentAlerts.map((alert: any) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{alert.category}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ml-2 ${priorityColor[alert.priority] ?? ""}`}>
                      {alert.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-red-500" />
              Relatos de Prescrições
            </CardTitle>
          </CardHeader>
          <CardContent>
            {openReports.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhum relato aberto</p>
            ) : (
              <div className="space-y-2">
                {openReports.map((report: any) => (
                  <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{report.description?.slice(0, 60)}...</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {report.reportType === "reacao_adversa" ? "Reação Adversa" : report.reportType}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ml-2 ${report.severity === "grave" ? "bg-red-500/10 text-red-700" : report.severity === "moderada" ? "bg-orange-500/10 text-orange-700" : "bg-blue-500/10 text-blue-700"}`}>
                      {report.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, onClick }: { icon: any; label: string; value: number; color: string; onClick?: () => void }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
          </div>
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center bg-muted/50 group-hover:bg-accent transition-colors ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
