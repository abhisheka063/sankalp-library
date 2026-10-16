import type { DashboardSummary, PublicConfig, RegistrationRow, RegistrationResult } from "../types";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

let pendingRequests = 0;
const loadingListeners = new Set<() => void>();
export const apiLoading = {
  subscribe(listener: () => void) { loadingListeners.add(listener); return () => loadingListeners.delete(listener); },
  getSnapshot() { return pendingRequests > 0; },
};

async function trackedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  pendingRequests += 1;
  loadingListeners.forEach((listener) => listener());
  try { return await fetch(input, init); }
  finally {
    pendingRequests = Math.max(0, pendingRequests - 1);
    loadingListeners.forEach((listener) => listener());
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await trackedFetch(`${API_URL}${path}`, init);
  const body = response.headers.get("content-type")?.includes("application/json")
    ? await response.json()
    : null;
  if (!response.ok) throw new Error(body?.detail || "The request could not be completed.");
  return body as T;
}

export const api = {
  publicConfig: () => request<PublicConfig>("/api/public/config"),
  register: (payload: Record<string, unknown>) => request<RegistrationResult>("/api/register", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
  }),
  login: (username: string, password: string) => request<{ access_token: string }>("/api/admin/login", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username, password }),
  }),
  summary: (token: string) => request<DashboardSummary>("/api/admin/summary", { headers: auth(token) }),
  registrations: (token: string, search: string) => request<RegistrationRow[]>(`/api/admin/registrations?q=${encodeURIComponent(search)}`, { headers: auth(token) }),
  updateRegistration: (token: string, number: string, payload: Record<string, unknown>) => request<{ ok: boolean }>(`/api/admin/registrations/${encodeURIComponent(number)}`, {
    method: "PATCH", headers: { ...auth(token), "content-type": "application/json" }, body: JSON.stringify(payload),
  }),
  deleteRegistration: (token: string, number: string) => request<{ ok: boolean }>(`/api/admin/registrations/${encodeURIComponent(number)}`, {
    method: "DELETE", headers: auth(token),
  }),
};

function auth(token: string): HeadersInit { return { Authorization: `Bearer ${token}` }; }

export function downloadUrl(token: string): string {
  return `${API_URL}/api/download/${encodeURIComponent(token)}`;
}

export async function downloadRegistrationPdf(token: string, registrationNo: string): Promise<void> {
  const response = await trackedFetch(downloadUrl(token));
  if (!response.ok) throw new Error("Unable to download the registration PDF.");
  const blobUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `${registrationNo}.pdf`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

export function adminExportUrl(): string { return `${API_URL}/api/admin/export.csv`; }

export async function downloadRegistrationsCsv(token: string): Promise<void> {
  const response = await trackedFetch(`${API_URL}/api/admin/export.csv`, { headers: auth(token) });
  if (!response.ok) throw new Error("Unable to export registrations.");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "registrations.csv";
  link.click();
  URL.revokeObjectURL(url);
}
