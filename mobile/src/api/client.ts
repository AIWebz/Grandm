import { API_URL } from "./config";
import { useAuthStore } from "../state/authStore";

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export class NetworkError extends Error {}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  formData?: FormData;
  auth?: boolean;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, formData, auth = true } = opts;
  const headers: Record<string, string> = {};
  if (auth) {
    const token = useAuthStore.getState().token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (body && !formData) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: formData ?? (body ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new NetworkError("Couldn't reach the server. Check your connection.");
  }

  let json: any = null;
  try {
    json = await response.json();
  } catch {
    // No JSON body (e.g. 204) - fine.
  }

  if (!response.ok) {
    throw new ApiError(response.status, json?.message ?? json?.error ?? "Something went wrong.", json?.error);
  }
  return json as T;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
  postForm: <T>(path: string, formData: FormData) => apiRequest<T>(path, { method: "POST", formData }),
};
