import Link from "next/link";
import { requireAdmin } from "@/lib/auth/staff-access";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-400">
              Lumora Administration
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Manage and monitor the Lumora platform.
            </p>
          </div>

          <span className="inline-flex w-fit items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
            Administrator
          </span>
        </header>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-slate-400">Administrator Account</p>

            <h2 className="mt-3 break-all text-lg font-semibold">
              {admin.email}
            </h2>

            <p className="mt-2 text-sm text-emerald-400">Account active</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-slate-400">Platform</p>

            <h2 className="mt-3 text-xl font-semibold">Lumora</h2>

            <p className="mt-2 text-sm text-slate-400">
              Premium dating experience
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-slate-400">Your Access Level</p>

            <h2 className="mt-3 text-xl font-semibold">Administrator</h2>

            <p className="mt-2 text-sm text-slate-400">
              Restricted administrative access
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Moderation</h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Review user reports and access the moderation tools currently
            available in Lumora.
          </p>

          <Link
            href="/moderation/reports"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Open Report Queue
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </Link>
          <Link
            href="/admin/moderation-log"
            className="mt-3 inline-flex items-center justify-center rounded-xl border border-violet-400/30 px-5 py-3 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/10"
          >
            View Moderation Audit Log
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </Link>
        </section>

        <footer className="mt-10 border-t border-white/10 pt-6 text-sm text-slate-500">
          Lumora Admin · Secure administrative area
        </footer>
      </div>
    </main>
  );
}
