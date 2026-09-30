import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="grid min-h-screen w-full place-items-center px-4 py-8">
      <SignIn />
    </main>
  );
}
