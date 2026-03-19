import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ChevronRight, Lightbulb, MessageCircle, Phone, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import ScoreBadge from "@/components/ScoreBadge";
import { useToast } from "@/hooks/use-toast";
import { Conversation, deleteConversation, getConversations } from "@/services/api";

type TranscriptMessage = {
  role: "agent" | "customer";
  time: string;
  text: string;
};

function buildTranscriptMessages(transcript: string): TranscriptMessage[] {
  const lines = transcript
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  return lines.slice(0, 12).map((line, idx) => {
    const match = line.match(/^(Agent|Customer)\s*:\s*(.+)$/i);
    const role = match
      ? match[1].toLowerCase() === "customer"
        ? "customer"
        : "agent"
      : idx % 2 === 0
        ? "agent"
        : "customer";
    const text = match ? match[2].trim() : line;

    return {
      role,
      time: `0:${String(idx * 8).padStart(2, "0")}`,
      text,
    };
  });
}

const Conversations = () => {
  const [items, setItems] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const data = await getConversations();
        setItems(data.items);
        if (!selectedId && data.items.length > 0) {
          setSelectedId(data.items[0].id);
        }
      } catch {
        toast({
          title: "Failed to load conversations",
          description: "Please refresh and try again.",
          variant: "destructive",
        });
      }
    }
    void load();
  }, [selectedId, toast]);

  const handleDelete = async (conversationId: string) => {
    const confirmed = window.confirm(`Delete conversation ${conversationId}?`);
    if (!confirmed) return;

    try {
      await deleteConversation(conversationId);
      const nextItems = items.filter((item) => item.id !== conversationId);
      setItems(nextItems);
      setSelectedId((prevSelected) => {
        if (prevSelected !== conversationId) return prevSelected;
        return nextItems[0]?.id ?? null;
      });
      window.dispatchEvent(new Event("auditUploaded"));
      toast({
        title: "Conversation deleted",
        description: `${conversationId} has been removed.`,
      });
    } catch {
      toast({
        title: "Delete failed",
        description: "Could not delete this conversation.",
        variant: "destructive",
      });
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((conv) => {
      return (
        conv.id.toLowerCase().includes(query) ||
        conv.agent.toLowerCase().includes(query) ||
        conv.customer.toLowerCase().includes(query) ||
        conv.summary.toLowerCase().includes(query)
      );
    });
  }, [items, search]);

  const selected = filtered.find((c) => c.id === selectedId) ?? filtered[0];

  const transcriptMessages = selected ? buildTranscriptMessages(selected.transcript) : [];

  return (
    <div className="py-6 md:py-8 space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-foreground">Conversations</h1>
        <p className="text-sm text-muted-foreground mt-1">Review audited conversations and AI-generated insights</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[600px]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 glass rounded-xl shadow-depth overflow-hidden"
        >
          <div className="p-4 border-b border-border/50">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="overflow-y-auto max-h-[540px]">
            {filtered.map((conv) => (
              <div
                key={conv.id}
                className={`w-full px-4 py-3.5 border-b border-border/20 transition-colors ${
                  selected?.id === conv.id ? "bg-primary/8" : "hover:bg-secondary/30"
                }`}
              >
                <button onClick={() => setSelectedId(conv.id)} className="w-full text-left">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {conv.type === "call" ? (
                        <Phone className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <MessageCircle className="w-3.5 h-3.5 text-accent-foreground" />
                      )}
                      <span className="text-xs font-mono text-muted-foreground">{conv.id}</span>
                    </div>
                    <ScoreBadge score={conv.score} size="sm" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{conv.agent}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{conv.summary}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                    <span>{conv.date}</span>
                    <span>{" • "}</span>
                    <span>{conv.duration}</span>
                    {!conv.compliance && (
                      <>
                        <span>{" • "}</span>
                        <span className="text-destructive flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> Violation
                        </span>
                      </>
                    )}
                  </div>
                </button>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    aria-label={`Delete conversation ${conv.id}`}
                    onClick={() => void handleDelete(conv.id)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 space-y-4"
        >
          {selected ? (
            <>
              <div className="glass rounded-xl p-5 shadow-depth">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-semibold text-foreground">{selected.id}</h2>
                      <ScoreBadge score={selected.score} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selected.agent} {"->"} {selected.customer}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selected.date} {" · "} {selected.duration} {" · "} {selected.type === "call" ? "Phone Call" : "Live Chat"}
                    </p>
                  </div>
                  {!selected.compliance && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <span className="text-xs font-medium text-destructive">Compliance Violation</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass rounded-xl p-5 shadow-depth">
                <h3 className="text-sm font-semibold text-foreground mb-4">Transcript</h3>
                <div className="space-y-3">
                  {transcriptMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`flex gap-3 ${msg.role === "agent" ? "" : "flex-row-reverse"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-xl text-sm ${
                          msg.role === "agent"
                            ? "bg-primary/10 border border-primary/20 text-foreground"
                            : "bg-secondary/60 border border-border/30 text-foreground"
                        }`}
                      >
                        <p className="text-xs font-semibold mb-1 text-muted-foreground">
                          {msg.role === "agent" ? "Agent" : "Customer"} {" · "} {msg.time}
                        </p>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-xl p-5 shadow-depth">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-warning" />
                  <h3 className="text-sm font-semibold text-foreground">AI Suggestions</h3>
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {(selected.suggestions.length
                      ? selected.suggestions
                      : ["No additional suggestions for this conversation"]).map((suggestion, i) => (
                      <motion.div
                        key={`${suggestion}-${i}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.08 }}
                        className="flex items-start gap-2.5 p-3 rounded-lg bg-warning/5 border border-warning/10"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
                        <span className="text-sm text-foreground">{suggestion}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </>
          ) : (
            <div className="glass rounded-xl p-8 text-muted-foreground">No conversations available yet.</div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Conversations;
