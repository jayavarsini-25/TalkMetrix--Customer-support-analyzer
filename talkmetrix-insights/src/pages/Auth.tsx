import { useState, type FormEvent } from "react";
import { Activity, ArrowRight, Building2, LockKeyhole, Mail, ShieldCheck, User2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

type AuthPageProps = {
  mode: "login" | "signup";
};

export default function Auth({ mode }: AuthPageProps) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    company: "",
    email: "",
    password: "",
  });

  const redirectTarget = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/dashboard";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (isSignup) {
        await signUp({
          full_name: form.fullName,
          company: form.company,
          email: form.email,
          password: form.password,
        });
        toast({
          title: "Account created",
          description: "Your workspace is ready.",
        });
      } else {
        await login({
          email: form.email,
          password: form.password,
        });
        toast({
          title: "Welcome back",
          description: "You are signed in.",
        });
      }

      navigate(redirectTarget, { replace: true });
    } catch (error) {
      toast({
        title: isSignup ? "Sign-up failed" : "Sign-in failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-8rem] top-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-[-6rem] top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-0 inset-x-0 h-72 bg-[radial-gradient(circle_at_bottom,hsl(188_80%_48%_/_0.14),transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:gap-12 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 space-y-8 py-8 lg:py-0"
        >
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary shadow-depth">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Talk<span className="text-primary">Metrix</span>
            </span>
          </Link>

          <div className="max-w-xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.28em] text-primary">
              QA Intelligence Platform
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {isSignup ? "Launch a cleaner support quality workflow." : "Step back into your audit command center."}
            </h1>
            <p className="max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              Keep the same cinematic dashboard aesthetic while giving teams a trustworthy front door for sign-up, sign-in,
              and secure access to every conversation review.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Secure access", body: "Session-based authentication for every protected workflow." },
              { icon: Building2, title: "Team ready", body: "Separate workspaces by company identity from day one." },
              { icon: LockKeyhole, title: "Protected insights", body: "Uploads and dashboard data stay behind sign-in." },
            ].map((item) => (
              <div key={item.title} className="glass rounded-2xl p-4 shadow-depth">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <h2 className="text-sm font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-xl lg:max-w-md"
        >
          <div className="glass-strong shadow-elevated rounded-[2rem] border border-border/60 p-6 sm:p-8">
            <div className="mb-8 space-y-2">
              <p className="text-sm uppercase tracking-[0.28em] text-primary">
                {isSignup ? "Create account" : "Sign in"}
              </p>
              <h2 className="text-2xl font-semibold">
                {isSignup ? "Start with your team details" : "Continue to your dashboard"}
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {isSignup
                  ? "Set up your account and open the TalkMetrix workspace in one step."
                  : "Use the email and password you created for this workspace."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignup ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <div className="relative">
                      <User2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="fullName"
                        required
                        value={form.fullName}
                        onChange={(event) => updateField("fullName", event.target.value)}
                        className="h-12 rounded-2xl border-border/70 bg-secondary/30 pl-11"
                        placeholder="Akhila Raman"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="company"
                        required
                        value={form.company}
                        onChange={(event) => updateField("company", event.target.value)}
                        className="h-12 rounded-2xl border-border/70 bg-secondary/30 pl-11"
                        placeholder="TalkMetrix Labs"
                      />
                    </div>
                  </div>
                </>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className="h-12 rounded-2xl border-border/70 bg-secondary/30 pl-11"
                    placeholder="team@talkmetrix.ai"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(event) => updateField("password", event.target.value)}
                    className="h-12 rounded-2xl border-border/70 bg-secondary/30 pl-11"
                    placeholder="Minimum 8 characters"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-2xl text-sm font-semibold">
                {isSubmitting ? "Please wait..." : isSignup ? "Create workspace" : "Sign in"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {isSignup ? "Already have an account?" : "Need a new workspace?"}{" "}
              <Link to={isSignup ? "/login" : "/signup"} className="font-medium text-primary hover:text-primary/80">
                {isSignup ? "Sign in" : "Create one"}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
