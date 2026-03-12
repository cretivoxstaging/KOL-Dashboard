"use client";

export const SPK_RESET_EVENT = "spk:reset-form";

export function dispatchSPKResetEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SPK_RESET_EVENT));
  }
}
