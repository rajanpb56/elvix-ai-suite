import { useEffect, useState } from "react";
import { ElvixMark } from "./Logo";

const KEY = "elvix:spashed";

/** Shows a ~1s branded splash once per browser session. */
export function Splash() {
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem(KEY);
    } catch {
      return true;
    }
  });
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      // ignore
    }
    const t1 = setTimeout(() => setLeaving(true), 950);
    const t2 = setTimeout(() => setVisible(false), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <div className="animate-in zoom-in-95 fade-in duration-700">
        <ElvixMark className="size-20" />
      </div>
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 text-center">
        <p className="font-display text-2xl font-bold tracking-tight">
          ELVI<span className="text-brand-gradient">X</span>
        </p>
        <p className="mt-1 text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
          Soch Se Solution Tak
        </p>
      </div>
    </div>
  );
}
