export default function AlertPanel({ alerts }: { alerts: any[] }) {
  return (
    <div className="glass rounded-xl p-6 shadow-depth">
      <h3 className="text-xl font-semibold">Recent Alerts</h3>
      <p className="text-sm text-muted-foreground mb-4">Latest quality notifications</p>
      <div className="space-y-3 max-h-[320px] overflow-y-auto">
        {alerts.map((a, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg border ${
              a.type === "critical"
                ? "border-destructive/40 bg-destructive/10"
                : a.type === "warning"
                  ? "border-warning/40 bg-warning/10"
                  : "border-primary/30 bg-primary/10"
            }`}
          >
            <p className="font-medium">{a.message}</p>
            <p className="text-sm text-muted-foreground">
              {a.agent} • {a.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
