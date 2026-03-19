import { useRef, useState } from "react";
import { FileAudio, FileText, IdCard, UploadCloud, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSupportedAudioFile, uploadAuditFile } from "@/services/api";

interface UploadState {
  name: string;
  size: string;
  agentId: string;
  agentName: string;
  status: "Uploading" | "Complete" | "Failed";
}

export default function Upload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [agentId, setAgentId] = useState("");
  const [agentName, setAgentName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<UploadState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const openFilePicker = () => fileInputRef.current?.click();

  async function uploadFile(file: File) {
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

    const lowerName = file.name.toLowerCase();
    const isTextOrPdf = lowerName.endsWith(".txt") || lowerName.endsWith(".pdf");
    if (!isTextOrPdf && !isSupportedAudioFile(file)) {
      setError("Only .txt, .pdf, and supported audio files are allowed.");
      return;
    }

    setError(null);
    setIsUploading(true);
    const fileEntry: UploadState = {
      name: file.name,
      size: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(file.size / 1024)} KB`,
      agentId: cleanedAgentId,
      agentName: cleanedAgentName,
      status: "Uploading",
    };

    const nextIndex = files.length;
    setFiles((prev) => [...prev, fileEntry]);

    try {
      await uploadAuditFile(file, cleanedAgentId, cleanedAgentName);
      setFiles((prev) => prev.map((f, i) => (i === nextIndex ? { ...f, status: "Complete" } : f)));
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      window.dispatchEvent(new Event("auditUploaded"));
    } catch {
      setFiles((prev) => prev.map((f, i) => (i === nextIndex ? { ...f, status: "Failed" } : f)));
      setError("Upload failed. Please retry.");
    } finally {
      setIsUploading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file ?? null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setSelectedFile(file ?? null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedFile) {
      void uploadFile(selectedFile);
      return;
    }
    setError("Please choose a file first.");
  };

  return (
    <div className="py-6 md:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload</h1>
        <p className="text-sm text-muted-foreground mt-1">Attach the agent details, then upload a .txt, .pdf, or almost any audio file for AI-powered quality auditing</p>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Agent ID</label>
            <div className="relative">
              <IdCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="AG-204"
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Agent Name</label>
            <div className="relative">
              <UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Akhila Raman"
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-xl border border-dashed border-border/70 p-12 flex flex-col items-center justify-center text-center space-y-4 bg-secondary/20"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
            <UploadCloud size={34} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold">Drop files here or click to browse</p>
          <p className="text-sm text-muted-foreground">Supports .txt, .pdf, and audio files like .mp3, .wav, .m4a, .aac, .ogg, and more</p>
          <Button type="button" onClick={openFilePicker} variant="outline" className="px-8 py-5 text-base">
            {selectedFile ? "Change File" : "Select File"}
          </Button>
          <p className="text-sm text-muted-foreground">
            {selectedFile ? `${selectedFile.name} selected` : "No file selected yet"}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,text/plain,application/pdf,audio/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" disabled={isUploading} className="sm:min-w-40">
            {isUploading ? "Uploading..." : "Upload and Analyze"}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </form>

      {files.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h2 className="mb-4 text-xl font-semibold">Uploaded Files</h2>
          <div className="space-y-3">
            {files.map((file, i) => (
              <div key={i} className="flex justify-between items-center bg-secondary/30 p-4 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  {isSupportedAudioFile({ name: file.name, type: "" } as File) ? (
                    <FileAudio className="text-primary" />
                  ) : (
                    <FileText className="text-primary" />
                  )}
                  <div>
                    <p>{file.name}</p>
                    <p className="text-sm text-muted-foreground">{file.size}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.agentId} - {file.agentName}
                    </p>
                  </div>
                </div>

                {file.status === "Uploading" ? (
                  <div className="w-32 h-2 bg-secondary rounded">
                    <div className="h-2 bg-primary rounded animate-pulse w-3/4" />
                  </div>
                ) : file.status === "Complete" ? (
                  <span className="text-success">Complete</span>
                ) : (
                  <span className="text-destructive">Failed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
