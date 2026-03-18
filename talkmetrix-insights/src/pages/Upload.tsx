import { useRef, useState } from "react";
import { FileAudio, FileText, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { uploadAuditFile } from "@/services/api";

interface UploadState {
  name: string;
  size: string;
  status: "Uploading" | "Complete" | "Failed";
}

export default function Upload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadState[]>([]);

  const openFilePicker = () => fileInputRef.current?.click();

  async function uploadFile(file: File) {
    const fileEntry: UploadState = {
      name: file.name,
      size: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(file.size / 1024)} KB`,
      status: "Uploading",
    };

    setFiles((prev) => [...prev, fileEntry]);
    const nextIndex = files.length;

    try {
      await uploadAuditFile(file);
      setFiles((prev) => prev.map((f, i) => (i === nextIndex ? { ...f, status: "Complete" } : f)));
      window.dispatchEvent(new Event("auditUploaded"));
    } catch {
      setFiles((prev) => prev.map((f, i) => (i === nextIndex ? { ...f, status: "Failed" } : f)));
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void uploadFile(file);
  };

  return (
    <div className="py-6 md:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload call recordings or chat transcripts for AI-powered quality auditing</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="glass rounded-xl border-dashed border-border/70 p-16 flex flex-col items-center justify-center text-center space-y-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
          <UploadCloud size={34} className="text-primary" />
        </div>
        <p className="text-3xl font-semibold">Drop files here or click to browse</p>
        <p className="text-sm text-muted-foreground">Supports .mp3, .wav, .txt, .json, .csv</p>
        <Button onClick={openFilePicker} variant="outline" className="px-8 py-5 text-base">
          Select Files
        </Button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
      </div>

      {files.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h2 className="mb-4 text-xl font-semibold">Uploaded Files</h2>
          <div className="space-y-3">
            {files.map((file, i) => (
              <div key={i} className="flex justify-between items-center bg-secondary/30 p-4 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  {file.name.endsWith(".mp3") || file.name.endsWith(".wav") ? (
                    <FileAudio className="text-primary" />
                  ) : (
                    <FileText className="text-primary" />
                  )}
                  <div>
                    <p>{file.name}</p>
                    <p className="text-sm text-muted-foreground">{file.size}</p>
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
