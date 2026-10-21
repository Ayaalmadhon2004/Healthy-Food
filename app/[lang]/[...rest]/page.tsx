import { notFound } from "next/navigation";

// Any URL under /en or /ar that matches no page lands here, so the 404 is rendered inside the
// [lang] layout (right language and direction, navbar and footer) instead of Next.js's bare default.
// Rendered per request so arbitrary URLs never fill the page cache.
export const dynamic = "force-dynamic";

export default function UnknownPage(): never {
  notFound();
}
