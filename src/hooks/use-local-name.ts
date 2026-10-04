import { useState } from "react";

const NAME_KEY = "elvix:name";

/** Read the locally saved display name (no account involved). */
export function getLocalName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

/** Persist the display name on this device only. */
export function setLocalName(value: string) {
  try {
    const clean = value.trim().slice(0, 60);
    if (clean) localStorage.setItem(NAME_KEY, clean);
    else localStorage.removeItem(NAME_KEY);
  } catch {
    // storage unavailable (private mode etc.) — ignore
  }
}

/**
 * Display name without any account: stored in localStorage on this device.
 * Re-syncs from localStorage during render so a name edited in Profile is
 * reflected everywhere on the next render/mount.
 */
export function useLocalName(): [string, (value: string) => void] {
  const [name, setNameState] = useState<string>(() => getLocalName());
  const [prevStored, setPrevStored] = useState<string>(name);

  const stored = getLocalName();
  if (stored !== prevStored) {
    setPrevStored(stored);
    setNameState(stored);
  }

  return [name, setLocalName];
}
