const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
const isPrivateIpv4Host = (hostname: string) =>
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) || /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname);

const localApiBaseUrl =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    isPrivateIpv4Host(window.location.hostname))
    ? `http://${window.location.hostname}:8000`
    : "";

const API_BASE_URL = rawApiBaseUrl?.replace(/\/+$/, "") ?? localApiBaseUrl;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not set. Configure it in Netlify environment variables.");
  }

  const res = await fetch(`${API_BASE_URL}${path}`, init);
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export interface DashboardSummary {
  avgScore: number;
  avgCompliance: number;
  agents: Array<{
    agent: string;
    score: number;
    conversations: number;
    compliance: number;
  }>;
  qualityTrend: Array<{ date: string; score: number; compliance: number }>;
  alerts: Array<{ type: "critical" | "warning" | "info"; message: string; agent: string; time: string }>;
}

export interface Conversation {
  id: string;
  agent: string;
  customer: string;
  date: string;
  duration: string;
  score: number;
  compliance: boolean;
  type: "call" | "chat";
  summary: string;
  suggestions: string[];
  transcript: string;
}

export interface AnalyticsPayload {
  agents: Array<{ agent: string; score: number; conversations: number; compliance: number }>;
  agentBars: Array<{ name: string; score: number; compliance: number }>;
  empathyTrend: Array<{ date: string; value: number }>;
}

export interface ReportItem {
  id: string;
  name: string;
  date: string;
  type: string;
  status: "completed" | "processing";
  size: string;
}

export interface UploadAuditResponse {
  conversation_id: string;
  filename: string;
  transcript: string;
  evaluation: {
    empathy: number;
    professionalism: number;
    compliance: number;
    resolution: number;
    score: number;
    summary: string;
    violations: string[];
    suggestions: string[];
  };
}

export async function getDashboardSummary() {
  return request<DashboardSummary>("/dashboard/summary");
}

export async function getConversations() {
  return request<{ items: Conversation[] }>("/dashboard/conversations");
}

export async function getAnalytics() {
  return request<AnalyticsPayload>("/dashboard/analytics");
}

export async function getReports() {
  return request<{ items: ReportItem[] }>("/dashboard/reports");
}

export async function uploadAuditFile(file: File, agentId?: string, agentName?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (agentId?.trim()) {
    formData.append("agent_id", agentId.trim());
  }
  if (agentName?.trim()) {
    formData.append("agent_name", agentName.trim());
  }
  const endpoint = file.type.startsWith("audio") ? "/upload/audio" : "/upload/chat";
  return request<UploadAuditResponse>(endpoint, {
    method: "POST",
    body: formData,
  });
}

export async function deleteConversation(conversationId: string) {
  return request<{ deleted: boolean; conversation_id: string }>(`/dashboard/conversations/${conversationId}`, {
    method: "DELETE",
  });
}
