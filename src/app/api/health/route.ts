import { getDb } from "@/lib/mongodb";

/**
 * GET /api/health
 * Confirms the app is running and can reach MongoDB.
 * Never returns connection details or error internals.
 */
export async function GET() {
  const started = Date.now();
  try {
    await getDb().command({ ping: 1 });
    return Response.json({ status: "ok", database: "ok", ms: Date.now() - started });
  } catch (err) {
    console.error("Health check: database unreachable", err instanceof Error ? err.name : err);
    return Response.json({ status: "degraded", database: "unreachable" }, { status: 503 });
  }
}
