import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Vida Realista" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/" });
    });
  }, [nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setErr("Verifique seu email pra confirmar a conta.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav({ to: "/" });
      }
    } catch (e: any) {
      setErr(e.message || "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setErr(null);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) setErr(String(r.error));
    else if (!r.redirected) nav({ to: "/" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="hud-panel w-full max-w-md rounded-2xl p-8">
        <Link to="/" className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-neon-purple">
          ← Voltar pro jogo
        </Link>
        <h1 className="mt-3 text-3xl font-black">
          <span className="bg-gradient-to-r from-[oklch(0.55_0.22_305)] to-[oklch(0.65_0.18_245)] bg-clip-text text-transparent">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Salve seu progresso na nuvem.</p>

        <Button
          type="button"
          onClick={google}
          variant="outline"
          className="mt-6 w-full gap-2 border-border bg-card/50 hover:bg-card"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09A6.94 6.94 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.42 3.46 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          Continuar com Google
        </Button>

        <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {err && <p className="text-xs text-neon-red">{err}</p>}
          <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[oklch(0.55_0.22_305)] to-[oklch(0.65_0.18_245)] font-bold uppercase tracking-widest">
            {loading ? "..." : mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
          className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "login" ? "Não tem conta? Criar agora" : "Já tem conta? Entrar"}
        </button>
      </div>
    </main>
  );
}
