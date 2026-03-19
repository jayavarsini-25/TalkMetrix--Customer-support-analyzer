import { ArrowRight, AudioWaveform, Activity, ChartColumnBig, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const featureCards = [
  {
    icon: AudioWaveform,
    title: "Upload calls or chats",
    body: "Bring customer conversations into one place with quick analysis flows for audio and text.",
  },
  {
    icon: ChartColumnBig,
    title: "See quality patterns fast",
    body: "Track score drift, compliance, and coaching priorities through the same dashboard language you already use.",
  },
  {
    icon: ShieldCheck,
    title: "Keep reviews protected",
    body: "Authenticated workspaces make team access feel intentional instead of open-by-default.",
  },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top,hsl(188_80%_48%_/_0.18),transparent_55%)]" />
        <div className="absolute -left-12 top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-10">
        <header className="glass-strong shadow-depth flex items-center justify-between rounded-full border border-border/50 px-5 py-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Talk<span className="text-primary">Metrix</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
              Sign in
            </Link>
            <Button asChild className="rounded-full px-5">
              <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                {isAuthenticated ? "Open dashboard" : "Start free"}
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-12 pb-12 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Support quality intelligence
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
                Customer support analytics with a sharper, calmer front door.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                TalkMetrix helps teams review conversations, surface coaching gaps, and monitor compliance in a dashboard
                that feels high-signal instead of noisy. The new public experience now matches that same visual system.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-7 text-sm font-semibold">
                <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                  {isAuthenticated ? "Go to dashboard" : "Create your workspace"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-border/70 bg-secondary/20 px-7 text-sm">
                <Link to="/login">Sign in to continue</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative"
          >
            <div className="glass-strong shadow-elevated rounded-[2rem] border border-border/60 p-5">
              <div className="gradient-card rounded-[1.5rem] border border-border/40 p-5">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Live quality pulse</p>
                    <h2 className="mt-1 text-2xl font-semibold">86.4 health score</h2>
                  </div>
                  <div className="rounded-2xl bg-primary/10 px-3 py-2 text-right">
                    <p className="text-xs uppercase tracking-[0.22em] text-primary">Delta</p>
                    <p className="mt-1 text-lg font-semibold text-primary">+8.2%</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: "Reviewed this week", value: "124" },
                    { label: "Compliance rate", value: "94%" },
                    { label: "Coaching alerts", value: "07" },
                    { label: "Top channel", value: "Voice" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-border/40 bg-background/50 p-4">
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {featureCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + index * 0.08 }}
              className="glass rounded-[1.75rem] border border-border/60 p-6 shadow-depth"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <card.icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{card.body}</p>
            </motion.div>
          ))}
        </section>
      </div>
    </div>
  );
}
