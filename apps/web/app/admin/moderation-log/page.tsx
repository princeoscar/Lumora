import Link from "next/link";
import { requireAdmin } from "@/lib/auth/staff-access";
import { getModerationAuditLogs } from "@/lib/db/moderation-audit";

const actionLabels: Record<string, string> = {
  MARK_IN_REVIEW: "Marked In Review",
  RESOLVE: "Resolved Report",
  DISMISS: "Dismissed Report",
  SUSPEND: "Suspended Account",
  BAN: "Banned Account",
};

export default async function ModerationAuditPage() {
  await requireAdmin();

  const logs = await getModerationAuditLogs();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-400">
              Lumora Administration
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Moderation Audit Log
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              A history of moderation actions performed across Lumora.
            </p>
          </div>

          <Link
            href="/admin/dashboard"
            className="inline-flex w-fit items-center rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            ← Admin Dashboard
          </Link>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-slate-400">Total Recorded Actions</p>

            <h2 className="mt-3 text-3xl font-bold">{logs.length}</h2>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-slate-400">Latest Activity</p>

            <h2 className="mt-3 text-lg font-semibold">
              {logs.length > 0
                ? logs[0].createdAt.toLocaleString()
                : "No activity yet"}
            </h2>
          </article>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 p-6">
            <h2 className="text-xl font-semibold">Action History</h2>

            <p className="mt-2 text-sm text-slate-400">
              Each entry represents a recorded moderation action.
            </p>
          </div>

          {logs.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-slate-400">
                No moderation actions have been recorded yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {logs.map((log) => (
                <article key={log.id} className="space-y-4 p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-semibold text-violet-300">
                      {actionLabels[log.action] ?? log.action}
                    </h3>

                    <time className="text-xs text-slate-500">
                      {log.createdAt.toLocaleString()}
                    </time>
                  </div>

                  <div className="grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-slate-500">Moderator</p>
                      <p className="mt-1 break-all text-slate-200">
                        {log.moderator.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Affected User</p>
                      <p className="mt-1 break-all text-slate-200">
                        {log.targetUser.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Report</p>
                      <p className="mt-1 break-all text-slate-200">
                        {log.report?.id ?? "Report no longer available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Report Status</p>
                      <p className="mt-1 text-slate-200">
                        {log.report?.status ?? "Unavailable"}
                      </p>
                    </div>
                  </div>

                  {log.note && (
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Moderator Note
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                        {log.note}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-10 border-t border-white/10 pt-6 text-sm text-slate-500">
          Lumora Admin · Moderation Audit History
        </footer>
      </div>
    </main>
  );
}
