import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-x flex min-h-[100svh] flex-col items-start justify-center gap-6 font-sans">
      <p className="text-label">404</p>
      <h1 className="text-section">Page not found</h1>
      <Link href="/" className="text-primary underline underline-offset-4">
        Back home
      </Link>
    </main>
  );
}
