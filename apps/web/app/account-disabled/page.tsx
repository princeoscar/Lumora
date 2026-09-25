import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AccountDisabledPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-xl border bg-card p-8 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">Lumora</p>

        <h1 className="mt-2 text-3xl font-semibold">
          Your account is currently unavailable
        </h1>

        <p className="mt-4 text-muted-foreground">
          Your Lumora account cannot access the application at the moment.
          Please contact support if you believe this is a mistake.
        </p>

        <Button asChild className="mt-6">
          <Link href="/">Return to Lumora</Link>
        </Button>
      </div>
    </main>
  );
}
