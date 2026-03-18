import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
}

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
}: Props) {
  const isNegative = (change ?? "").trim().startsWith("-");
  return (
    <div className="glass rounded-xl p-6 shadow-depth flex justify-between gap-4">
      <div>
        <p className="text-muted-foreground text-sm">{title}</p>
        <h2 className="text-5xl/none font-semibold mt-4">{value}</h2>
        {change && (
          <p className={`text-sm mt-3 ${isNegative ? "text-destructive" : "text-success"}`}>{change}</p>
        )}
      </div>

      <div className="bg-primary/15 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center">
        <Icon className="text-primary w-5 h-5" />
      </div>
    </div>
  );
}
