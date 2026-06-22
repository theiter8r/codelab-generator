import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[60dvh] w-full max-w-md place-items-center px-4 text-center">
      <div className="animate-fade-up">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Button asChild className="mt-6">
          <Link href="/labs">Browse labs</Link>
        </Button>
      </div>
    </main>
  );
}
