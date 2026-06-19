import { AppShell } from "@/components/AppShell";

/**
 * Dynamic page route. AppShell reads `pageId` from the URL via
 * `useParams()`, so the same client component powers both
 * the root `/` and `/pages/[pageId]` views. When a user picks
 * a page in the sidebar we `router.push` to its URL, and when
 * the page is deleted/archived the shell falls back to `/`.
 */
export default function PageRoute() {
  return <AppShell />;
}
