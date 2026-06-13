import { getOrCreateSessionId } from "./session";

/**
 * Thin wrapper around `fetch` that automatically attaches the
 * anonymous `x-session-id` header to every request, so the API
 * can scope data to the current browser.
 */
export async function apiFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const sessionId = getOrCreateSessionId();
  const headers = new Headers(init.headers);
  if (sessionId) headers.set("x-session-id", sessionId);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}
