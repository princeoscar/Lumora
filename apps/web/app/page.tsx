import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b0812] text-white">
      {/* Navigation */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="text-2xl font-semibold tracking-[-0.04em]">
            Lumora
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <Link href="#about" className="transition hover:text-white">
              About
            </Link>

            <Link href="#features" className="transition hover:text-white">
              Features
            </Link>

            <Link href="#premium" className="transition hover:text-white">
              Premium
            </Link>
          </nav>

          <Link
            href="/sign-in"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium transition hover:bg-white/10"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />

        <div className="relative mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-7xl items-center px-6 py-24 lg:px-8">
          <div className="max-w-4xl">
            <p className="mb-6 text-sm font-medium uppercase tracking-[0.3em] text-purple-300">
              Dating, reimagined
            </p>

            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-6xl lg:text-8xl">
              Find a connection
              <span className="block bg-gradient-to-r from-purple-300 via-fuchsia-300 to-white bg-clip-text text-transparent">
                that feels different.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/60 sm:text-xl">
              Lumora is a premium dating experience built around genuine
              connections, thoughtful discovery, and conversations that actually
              matter.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Create your account
              </Link>

              <Link
                href="#about"
                className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 px-8 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Discover Lumora
              </Link>
            </div>

            <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/40">
              <span>Thoughtful matching</span>
              <span>•</span>
              <span>Premium experience</span>
              <span>•</span>
              <span>Built for connection</span>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-purple-300">
              Why Lumora
            </p>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Less noise.
              <br />
              More meaning.
            </h2>
          </div>

          <div className="max-w-xl">
            <p className="text-lg leading-8 text-white/60">
              Modern dating can feel overwhelming. Lumora is designed to make
              the experience feel more intentional — giving people space to
              discover each other beyond endless swiping.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features">
        <div className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-purple-300">
              The experience
            </p>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Designed around people,
              <br />
              not profiles.
            </h2>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            <FeatureCard
              number="01"
              title="Discover"
              description="Explore people who align with your interests, personality, and relationship goals."
            />

            <FeatureCard
              number="02"
              title="Connect"
              description="Move beyond surface-level interactions and start conversations with real potential."
            />

            <FeatureCard
              number="03"
              title="Belong"
              description="Build meaningful relationships in an environment designed to feel personal and premium."
            />
          </div>
        </div>
      </section>

      {/* Premium */}
      <section id="premium" className="border-t border-white/10">
        <div className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="relative overflow-hidden rounded-[2rem] border border-purple-300/20 bg-gradient-to-br from-purple-950/70 via-[#171020] to-[#0d0914] p-8 sm:p-12 lg:p-16">
            <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-purple-500/20 blur-[100px]" />

            <div className="relative max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-purple-200">
                Lumora Premium
              </p>

              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Dating should feel exceptional.
              </h2>

              <p className="mt-6 text-lg leading-8 text-white/60">
                Unlock a more intentional dating experience with premium
                features designed to give you more control over how you discover
                and connect.
              </p>

              <Link
                href="/sign-up"
                className="mt-8 inline-flex h-13 items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Join Lumora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} Lumora. All rights reserved.</p>

          <p>Meaningful connections, thoughtfully designed.</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:-translate-y-1 hover:border-purple-300/20 hover:bg-white/[0.05]">
      <span className="text-sm text-white/30">{number}</span>

      <h3 className="mt-12 text-2xl font-semibold tracking-[-0.03em]">
        {title}
      </h3>

      <p className="mt-4 leading-7 text-white/50">{description}</p>
    </div>
  );
}
