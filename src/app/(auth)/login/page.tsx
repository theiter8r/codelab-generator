import Link from "next/link";
import { redirect } from "next/navigation";
import { Terminal } from "lucide-react";
import { getUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectParam } = await searchParams;
  const redirectTo =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : "/dashboard";

  const user = await getUser();
  if (user) redirect(redirectTo);

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-sm flex-col justify-center px-4 py-12">
      <div className="animate-fade-up">
        <Link href="/" className="mb-8 flex items-center gap-2 font-semibold">
          <span className="grid size-7 place-items-center rounded-md bg-foreground text-background">
            <Terminal className="size-4" strokeWidth={2.5} />
          </span>
          CodeLabs
        </Link>

        <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to track your progress through the labs.
        </p>

        <div className="mt-6 grid gap-4">
          <OAuthButtons redirectTo={redirectTo} />

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <AuthForm redirectTo={redirectTo} />
        </div>
      </div>
    </main>
  );
}
