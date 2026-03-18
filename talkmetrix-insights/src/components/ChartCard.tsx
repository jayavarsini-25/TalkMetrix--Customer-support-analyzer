import { motion } from "framer-motion";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  delay?: number;
  children: React.ReactNode;
}

export default function ChartCard({ title, subtitle, delay = 0, children }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-xl p-5 shadow-depth"
    >
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      {subtitle ? <p className="text-muted-foreground mt-0.5 mb-4">{subtitle}</p> : null}
      {children}
    </motion.div>
  );
}
