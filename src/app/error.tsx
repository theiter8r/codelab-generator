"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto grid min-h-[60dvh] w-full max-w-md place-items-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset} className="mt-6">
          Try again
        </Button>
      </div>
    </main>
  );
}
