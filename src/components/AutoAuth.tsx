import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useEffect, useRef } from "react";

/** Signs every visitor in automatically via the anonymous provider —
 *  ELVIX needs no login screen. No redirects, no OTP, nothing to fill in. */
export function AutoAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn } = useAuthActions();
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !attemptedRef.current) {
      attemptedRef.current = true;
      signIn("anonymous").catch((err: unknown) => {
        console.warn("[ELVIX] Auto sign-in failed:", err);
      });
    }
  }, [isLoading, isAuthenticated, signIn]);

  return null;
}
