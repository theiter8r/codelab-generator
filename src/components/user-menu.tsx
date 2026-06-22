"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LayoutDashboard, LogOut, PenSquare, User } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

type Props = {
  userId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
};

export function UserMenu({ userId, email, displayName, avatarUrl, isAdmin }: Props) {
  const label = displayName || email;
  const initial = (displayName || email).charAt(0).toUpperCase();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="Account menu"
          className="grid size-8 place-items-center overflow-hidden rounded-full border border-border bg-secondary text-sm font-medium text-secondary-foreground transition-transform duration-150 ease-[var(--ease-out)] hover:bg-muted active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            initial
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-56 origin-[var(--radix-dropdown-menu-content-transform-origin)] rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-[menu-in_160ms_var(--ease-out)] data-[state=closed]:animate-[menu-out_120ms_ease-in]"
        >
          <div className="px-2 py-1.5">
            <p className="truncate text-sm font-medium">{label}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          <MenuLink href={`/u/${userId}`} icon={<User className="size-4" />}>
            View profile
          </MenuLink>
          <MenuLink href="/dashboard" icon={<LayoutDashboard className="size-4" />}>
            My progress
          </MenuLink>
          {isAdmin && (
            <MenuLink href="/admin" icon={<PenSquare className="size-4" />}>
              Author labs
            </MenuLink>
          )}

          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item asChild>
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground outline-none transition-colors data-[highlighted]:bg-muted"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </form>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu.Item asChild>
      <Link
        href={href}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground outline-none transition-colors data-[highlighted]:bg-muted"
      >
        {icon}
        {children}
      </Link>
    </DropdownMenu.Item>
  );
}
