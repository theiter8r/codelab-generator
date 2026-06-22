"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

export function AuthForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);

    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setPending(false);
        return;
      }
      router.push(redirectTo);
      router.refresh();
      return;
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }
    // If email confirmation is enabled there is no active session yet.
    if (data.session) {
      router.push(redirectTo);
      router.refresh();
    } else {
      setNotice("Check your inbox to confirm your email, then sign in.");
      setMode("signin");
      setPending(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-subtle p-1">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
              setNotice(null);
            }}
            className={cn(
              "relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 ease-[var(--ease-out)]",
              mode === m
                ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="text-sm text-[var(--success)]" role="status">
            {notice}
          </p>
        )}

        <Button type="submit" disabled={pending}>
          {pending && <Spinner />}
          {mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
