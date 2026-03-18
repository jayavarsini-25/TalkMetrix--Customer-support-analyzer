import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Filter, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";

import ChartCard from "@/components/ChartCard";
import { AnalyticsPayload, getAnalytics } from "@/services/api";

const Analytics3DView = lazy(() => import("@/components/Analytics3DView"));

const tooltipStyle = {
  backgroundColor: "hsl(224, 18%, 11%)",
  border: "1px solid hsl(220, 14%, 18%)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(210, 15%, 92%)",
};

const Analytics = () => {
  const [payload, setPayload] = useState<AnalyticsPayload | null>(null);
  const [agentFilter, setAgentFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const data = await getAnalytics();
      setPayload(data);
    }
    void load();
  }, []);

  const bars = useMemo(() => {
    if (!payload) return [];
    if (agentFilter === "all") return payload.agentBars;
    return payload.agentBars.filter((x) => x.name === agentFilter);
  }, [payload, agentFilter]);

  const empathyTrend = useMemo(() => {
    if (!payload) return [];
    return payload.empathyTrend;
  }, [payload]);

  const complianceData = useMemo(() => {
    if (!payload) return [];
    return payload.agents.map((agent) => ({
      category: agent.agent.split(" ")[0],
      score: agent.compliance,
    }));
  }, [payload]);

  const radarData = useMemo(() => {
    if (!payload || payload.agents.length === 0) return [];
    const top = payload.agents[0];
    const bottom = payload.agents[payload.agents.length - 1];
    return [
      { metric: "Empathy", A: top.score, B: bottom.score },
      { metric: "Clarity", A: top.compliance, B: bottom.compliance },
      { metric: "Resolution", A: top.score, B: bottom.score },
      { metric: "Speed", A: top.compliance, B: bottom.compliance },
      { metric: "Compliance", A: top.compliance, B: bottom.compliance },
      { metric: "Knowledge", A: top.score, B: bottom.score },
    ];
  }, [payload]);

  return (
    <div className="py-6 md:py-8 space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Deep performance insights with interactive visualizations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/60 border border-border/50 text-sm">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="bg-transparent text-foreground text-sm outline-none cursor-pointer"
            >
              <option value="all">All Agents</option>
              {(payload?.agentBars ?? []).map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="mb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Agent Performance - 3D Overview</h3>
        </div>
        <Suspense fallback={<div className="h-[400px] glass rounded-xl flex items-center justify-center text-sm text-muted-foreground">Loading 3D...</div>}>
          <Analytics3DView data={payload?.agentBars ?? []} />
        </Suspense>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Agent Performance Comparison" subtitle="Quality scores by agent" delay={0.2}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="score" fill="hsl(188, 80%, 48%)" radius={[4, 4, 0, 0]} name="Quality Score" />
                <Bar dataKey="compliance" fill="hsl(158, 64%, 42%)" radius={[4, 4, 0, 0]} name="Compliance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Empathy Trend" subtitle="Weekly empathy scores by top agents" delay={0.25}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={empathyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
                <XAxis dataKey="date" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Empathy" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Compliance Breakdown" subtitle="Score by compliance category" delay={0.3}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complianceData} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="category" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="score" fill="hsl(188, 80%, 48%)" radius={[0, 4, 4, 0]} name="Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Quality Radar" subtitle="Top vs bottom performer comparison" delay={0.35}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220, 14%, 16%)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} />
                <Radar name="Top Performer" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Bottom Performer" dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: "11px", color: "hsl(215, 12%, 50%)" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Analytics;
