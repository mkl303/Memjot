const SESSION_KEY = "notion_session_id";

/**
 * Generates a v4 UUID. Uses crypto.randomUUID when available,
 * falls back to a Math.random-based generator for older runtimes.
 */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Returns a stable, anonymous identifier for the current browser.
 * The ID is created on first call and persisted to localStorage.
 * On the server (no window) it returns an empty string.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = generateUUID();
      window.localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // localStorage may be disabled (e.g. private mode). Fall back
    // to an in-memory ID for this page load only.
    return generateUUID();
  }
}
