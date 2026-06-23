// Lightweight typed fetch client for the BOVITRACK API.
// Token is stored in localStorage and attached to every request.

import { API_URL } from "./config";

const TOKEN_KEY = "bovitrack_token";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
  meta?: { total: number };
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Impossible de joindre le serveur. Vérifiez que le backend est démarré.");
  }

  let json: ApiEnvelope<T> | null = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok || !json?.success) {
    const message = json?.error || `Erreur ${res.status}`;
    // Auto-logout on auth failure
    if (res.status === 401 && typeof window !== "undefined") {
      clearToken();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    throw new ApiError(res.status, message);
  }

  return json.data;
}

/**
 * Downloads a binary file (e.g. a generated PDF) from a protected endpoint.
 * Sends the Bearer token via header (window.open can't), so auth still works,
 * then triggers a browser download via an object URL. Mirrors the 401
 * auto-logout behaviour of request().
 */
export async function downloadFile(path: string, filename: string): Promise<void> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    throw new ApiError(0, "Impossible de joindre le serveur. Vérifiez que le backend est démarré.");
  }

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      clearToken();
      if (!window.location.pathname.startsWith("/login")) window.location.href = "/login";
    }
    // Error responses are JSON envelopes, not PDFs
    let message = `Erreur ${res.status}`;
    try {
      const json = await res.json();
      if (json?.error) message = json.error;
    } catch {
      /* non-JSON */
    }
    throw new ApiError(res.status, message);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
  download: downloadFile,
};
