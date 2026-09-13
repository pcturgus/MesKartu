import { LoginForm } from "./LoginForm";
import { HeartMark } from "@/components/HeartMark";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-7 shadow-[var(--shadow)]">
        <HeartMark size={44} className="mb-2" />
        <h1 className="text-4xl mb-1" style={{ color: "var(--dusk)" }}>
          MesKartu.Lt
        </h1>
        <p className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-4">Porų erdvė</p>
        <p className="text-sm text-ink-soft mb-6">Prisijunk, kad tęstum aktyvumo žurnalą.</p>
        <LoginForm />
      </div>
    </main>
  );
}
