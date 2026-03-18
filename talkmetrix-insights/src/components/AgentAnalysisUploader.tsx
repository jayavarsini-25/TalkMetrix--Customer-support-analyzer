import { FormEvent, useRef, useState } from "react";
import { FileText, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadAuditFile } from "@/services/api";

interface AgentRun {
  id: string;
  agentId: string;
  agentName: string;
  fileName: string;
  score: number;
  compliance: number;
  summary: string;
  status: "Complete" | "Failed";
}

export default function AgentAnalysisUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [agentId, setAgentId] = useState("");
  const [agentName, setAgentName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runs, setRuns] = useState<AgentRun[]>([]);

  const onPickFile = () => fileInputRef.current?.click();

  const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const onAnalyze = async (event: FormEvent) => {
    event.preventDefault();

    const cleanedAgentId = agentId.trim();
    const cleanedAgentName = agentName.trim();
    if (!cleanedAgentId) {
      setError("Agent ID is required.");
      return;
    }
    if (!cleanedAgentName) {
      setError("Agent name is required.");
      return;
    }
    if (!selectedFile) {
      setError("Please upload a .txt file.");
      return;
    }
    if (!selectedFile.name.toLowerCase().endsWith(".txt")) {
      setError("Only .txt files are supported here.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await uploadAuditFile(selectedFile, cleanedAgentId, cleanedAgentName);
      setRuns((prev) => [
        {
          id: result.conversation_id,
          agentId: cleanedAgentId,
          agentName: cleanedAgentName,
          fileName: selectedFile.name,
          score: result.evaluation.score,
          compliance: result.evaluation.compliance,
          summary: result.evaluation.summary,
          status: "Complete",
        },
        ...prev,
      ]);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      window.dispatchEvent(new Event("auditUploaded"));
    } catch (e) {
      setRuns((prev) => [
        {
          id: `failed-${Date.now()}`,
          agentId: cleanedAgentId,
          agentName: cleanedAgentName,
          fileName: selectedFile.name,
          score: 0,
          compliance: 0,
          summary: "Analysis failed",
          status: "Failed",
        },
        ...prev,
      ]);
      setError(e instanceof Error ? e.message : "Failed to analyze agent performance.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="glass rounded-xl p-6 shadow-depth space-y-5">
      <div>
        <h3 className="text-3xl font-semibold">Analyze Agent Performance</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add an agent ID, upload a transcript, and run quality analysis.
        </p>
      </div>

      <form onSubmit={onAnalyze} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[180px_220px_1fr_auto]">
          <Input
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            placeholder="Agent ID"
            aria-label="Agent ID"
          />
          <Input
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="Agent Name"
            aria-label="Agent Name"
          />
          <button
            type="button"
            onClick={onPickFile}
            className="w-full rounded-md border border-border/60 bg-secondary/20 px-4 py-2 text-left text-sm hover:bg-secondary/40 transition-colors"
          >
            {selectedFile ? selectedFile.name : "Upload .txt file"}
          </button>
          <Button type="submit" disabled={isAnalyzing}>
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          className="hidden"
          onChange={onSelectFile}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>

      {runs.length === 0 ? (
        <div className="rounded-lg border border-border/50 p-6 text-sm text-muted-foreground flex items-center gap-3">
          <UploadCloud size={16} />
          No analysis runs yet.
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => (
            <div
              key={run.id}
              className="rounded-lg border border-border/60 bg-secondary/20 p-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between"
            >
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Agent: {run.agentId} - {run.agentName}
                </p>
                <p className="font-medium flex items-center gap-2">
                  <FileText size={16} />
                  {run.fileName}
                </p>
                <p className="text-sm text-muted-foreground">{run.summary}</p>
              </div>
              <div className="text-sm md:text-right">
                <p>Score: {run.score}</p>
                <p>Compliance: {run.compliance}%</p>
                <p className={run.status === "Complete" ? "text-success" : "text-destructive"}>
                  {run.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
