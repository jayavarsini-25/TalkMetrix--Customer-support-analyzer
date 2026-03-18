import { useEffect, useState } from "react";
import { AlertTriangle, BarChart3, MessageSquare, ShieldCheck } from "lucide-react";

import AgentAnalysisUploader from "@/components/AgentAnalysisUploader";
import AlertPanel from "@/components/AlertPanel";
import QualityChart from "@/components/QualityChart";
import StatCard from "@/components/StatCard";
import { DashboardSummary, getDashboardSummary } from "@/services/api";

export default function Index() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await getDashboardSummary();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    }
  }

  useEffect(() => {
    void load();
    window.addEventListener("auditUploaded", load);
    return () => window.removeEventListener("auditUploaded", load);
  }, []);

  if (error) {
    return <div className="p-8 text-destructive">{error}</div>;
  }

  if (!data) {
    return <div className="p-8 text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="py-6 md:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Quality performance overview for your team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Overall Quality Score"
          value={data.avgScore.toFixed(1)}
          change="+4.2% vs last month"
          icon={BarChart3}
        />
        <StatCard
          title="Compliance Rate"
          value={`${data.avgCompliance.toFixed(1)}%`}
          change="+1.8% vs last month"
          icon={ShieldCheck}
        />
        <StatCard
          title="Conversations Analyzed"
          value={String(data.agents.reduce((sum, a) => sum + a.conversations, 0))}
          change="+12% vs last month"
          icon={MessageSquare}
        />
        <StatCard
          title="Active Alerts"
          value={String(data.alerts.length)}
          change="-3 vs last month"
          icon={AlertTriangle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <QualityChart data={data.qualityTrend} />
        </div>
        <AlertPanel alerts={data.alerts} />
      </div>

      <AgentAnalysisUploader />
    </div>
  );
}
