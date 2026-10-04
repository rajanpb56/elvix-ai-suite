import { useConvexAuth } from "convex/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

/**
 * ELVIX needs no login — every visitor is signed in automatically via the
 * anonymous provider (see AutoAuth in main.tsx). This wrapper only waits for
 * that automatic session to settle so data never flashes empty, and it never
 * redirects anywhere. If sign-in can't complete quickly, the app renders
 * anyway.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [proceedAnyway, setProceedAnyway] = useState(false);

  useEffect(() => {
    if (isAuthenticated) return;
    const t = setTimeout(() => setProceedAnyway(true), 4000);
    return () => clearTimeout(t);
  }, [isAuthenticated]);

  if ((isLoading || !isAuthenticated) && !proceedAnyway) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return children;
}
