export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="mt-4 text-sm text-muted-foreground">
          Preparing your Lumora profile...
        </p>
      </div>
    </main>
  );
}
