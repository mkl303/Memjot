import { getOrCreateUserId } from "./session";

/**
 * Thin wrapper around `fetch` that automatically attaches the
 * per-device `x-user-id` header to every request, so the API
 * can scope documents to a single browser/device for reads,
 * writes, and deletes.
 */
export async function apiFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers);
  const userId = getOrCreateUserId();
  if (userId) headers.set("x-user-id", userId);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}
