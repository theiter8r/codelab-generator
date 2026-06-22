import Link from "next/link";
import { Terminal } from "lucide-react";
import { getSessionContext } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const { user, profile } = await getSessionContext();
  const isAdmin = profile?.role === "admin";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[color-mix(in_srgb,var(--background)_80%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          <span className="grid size-7 place-items-center rounded-md bg-foreground text-background">
            <Terminal className="size-4" strokeWidth={2.5} />
          </span>
          CodeLabs
        </Link>

        <nav className="ml-2 hidden items-center gap-1 text-sm sm:flex">
          <NavLink href="/labs">Labs</NavLink>
          {user && <NavLink href="/dashboard">My progress</NavLink>}
          {isAdmin && <NavLink href="/admin">Author</NavLink>}
          {isAdmin && <NavLink href="/admin/templates">Templates</NavLink>}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <UserMenu
              userId={user.id}
              email={user.email ?? ""}
              displayName={profile?.display_name ?? null}
              avatarUrl={profile?.avatar_url ?? null}
              isAdmin={isAdmin}
            />
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
    >
      {children}
    </Link>
  );
}
