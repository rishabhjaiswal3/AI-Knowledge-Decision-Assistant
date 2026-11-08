// The session lives in an HttpOnly cookie set by the backend. The browser
// sends it automatically; JavaScript never sees or stores the token.

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

// Lets the auth layer react when any call finds the session expired.
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => { onUnauthorized = fn; };

export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.json !== undefined) headers.set("Content-Type", "application/json");

  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      headers,
      credentials: "include",
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith("/auth/")) onUnauthorized?.();
    const detail = data?.detail;
    throw new ApiError(typeof detail === "string" ? detail : "Something went wrong. Please try again.", res.status);
  }
  return data as T;
}

export type User = { id: string; name: string; email: string };
export type Organization = { id: string; name: string; created_at: string };
export type Session = { user: User; organization: Organization };
