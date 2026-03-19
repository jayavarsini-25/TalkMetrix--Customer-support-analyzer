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
const AUTH_TOKEN_STORAGE_KEY = "talkmetrix.auth.token";
const AUDIO_FILE_EXTENSIONS = [
  ".mp3",
  ".wav",
  ".m4a",
  ".aac",
  ".ogg",
  ".oga",
  ".flac",
  ".opus",
  ".webm",
  ".wma",
  ".aiff",
  ".aif",
  ".amr",
  ".3gp",
  ".mp4",
  ".mpeg",
  ".mpga",
] as const;

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  company: string;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignUpPayload extends LoginPayload {
  full_name: string;
  company: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

function getAuthHeaders(init?: RequestInit) {
  const headers = new Headers(init?.headers);
  const token = getStoredAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

function storeAuthToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  }
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
}

export function getStoredAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

async function parseError(res: Response): Promise<string> {
  try {
    const payload = (await res.json()) as { detail?: string };
    if (payload.detail) {
      return payload.detail;
    }
  } catch {
    return `API request failed: ${res.status} ${res.statusText}`;
  }
  return `API request failed: ${res.status} ${res.statusText}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not set. Configure it in Netlify environment variables.");
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: getAuthHeaders(init),
    });
  } catch {
    throw new Error(
      `Unable to reach backend at ${API_BASE_URL}. Check the Netlify VITE_API_BASE_URL value, Render service status, and CORS settings.`,
    );
  }
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return (await res.json()) as T;
}

async function requestAuth<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await request<T>(path, init);
  return response;
}

export async function signUpUser(payload: SignUpPayload) {
  const auth = await requestAuth<AuthResponse>("/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  storeAuthToken(auth.token);
  return auth;
}

export async function loginUser(payload: LoginPayload) {
  const auth = await requestAuth<AuthResponse>("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  storeAuthToken(auth.token);
  return auth;
}

export async function getCurrentUser() {
  const response = await request<{ user: AuthUser }>("/auth/me");
  return response.user;
}

export async function logoutUser() {
  await request<{ success: boolean }>("/auth/logout", {
    method: "POST",
  });
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
  agent: string;
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

export function isSupportedAudioFile(file: File) {
  const lowerName = file.name.toLowerCase();
  return file.type.startsWith("audio/") || AUDIO_FILE_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
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
  const endpoint = isSupportedAudioFile(file) ? "/upload/audio" : "/upload/chat";
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
