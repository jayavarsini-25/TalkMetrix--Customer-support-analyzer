import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export default function AgentTable({ agents }: { agents: any[] }) {
  return (
    <div className="glass rounded-xl p-6 shadow-depth">
      <h3 className="text-3xl font-semibold">Agent Performance</h3>
      <p className="text-sm text-muted-foreground mb-4">Individual agent quality metrics</p>
      <table className="w-full text-left">
        <thead className="text-muted-foreground text-sm uppercase tracking-wider">
          <tr>
            <th className="pb-4">Agent</th>
            <th className="pb-4">Score</th>
            <th className="pb-4">Conversations</th>
            <th className="pb-4">Compliance</th>
            <th className="pb-4">Trend</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((a, i) => {
            const trend = a.score >= 90 ? "up" : a.score >= 80 ? "flat" : "down";
            return (
              <tr key={i} className="border-t border-border/60">
                <td className="py-4">{a.agent}</td>
                <td className="py-4">{a.score}</td>
                <td className="py-4">{a.conversations}</td>
                <td className="py-4">{a.compliance}%</td>
                <td className="py-4">
                  {trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4 text-success" />
                  ) : trend === "down" ? (
                    <ArrowDownRight className="w-4 h-4 text-destructive" />
                  ) : (
                    <Minus className="w-4 h-4 text-muted-foreground" />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
