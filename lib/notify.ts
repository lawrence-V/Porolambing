import type { SessionKind } from "@/lib/store/types";

/**
 * Session-end alerts. Without these the timer only works while you're staring
 * at it, which defeats the point of running one.
 */

/**
 * Two notes per kind. Focus ending resolves upward (you earned the break);
 * a break ending resolves downward (back to work).
 */
const CHIME: Record<SessionKind, [number, number]> = {
  focus: [587.33, 880.0], // D5 -> A5
  shortBreak: [880.0, 587.33], // A5 -> D5
  longBreak: [880.0, 587.33],
};

declare global {
  interface Window {
    /** Older Safari still only exposes the prefixed constructor. */
    webkitAudioContext?: typeof AudioContext;
  }
}

let context: AudioContext | null = null;

/**
 * Browsers hand back a suspended AudioContext unless it's created or resumed
 * inside a user gesture, so this is called from the Start press rather than at
 * module load. Safe to call repeatedly.
 */
export function primeAudio(): void {
  if (typeof window === "undefined") return;
  try {
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return;
    context ??= new Ctor();
    if (context.state === "suspended") void context.resume();
  } catch {
    // Audio is a nicety; never let it break starting a timer.
    context = null;
  }
}

export function playChime(kind: SessionKind): void {
  primeAudio();
  if (!context) return;

  try {
    const now = context.currentTime;
    CHIME[kind].forEach((frequency, index) => {
      const at = now + index * 0.18;
      const oscillator = context!.createOscillator();
      const gain = context!.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      // Quick attack, gentle decay — a soft bell rather than a beep.
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.18, at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.55);

      oscillator.connect(gain).connect(context!.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.6);
    });
  } catch {
    // Ignore — a missing chime should never interrupt the session flow.
  }
}

export type Cue = "start" | "resume" | "pause" | "skip" | "reset";

/**
 * Short feedback blips for the controls. Deliberately quieter than the
 * session chime — these confirm a press, they don't announce anything, and
 * they must not compete with the sound that says a session ended.
 */
const CUES: Record<Cue, { notes: number[]; gain: number }> = {
  start: { notes: [587.33, 880.0], gain: 0.09 },
  resume: { notes: [587.33, 880.0], gain: 0.09 },
  pause: { notes: [880.0, 587.33], gain: 0.09 },
  skip: { notes: [740.0], gain: 0.07 },
  reset: { notes: [392.0], gain: 0.07 },
};

export function playCue(cue: Cue): void {
  primeAudio();
  if (!context) return;

  try {
    const { notes, gain: peak } = CUES[cue];
    const now = context.currentTime;
    notes.forEach((frequency, index) => {
      const at = now + index * 0.07;
      const oscillator = context!.createOscillator();
      const gain = context!.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.value = frequency;

      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(peak, at + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.13);

      oscillator.connect(gain).connect(context!.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.15);
    });
  } catch {
    // A missing blip must never interrupt the control it belongs to.
  }
}

const NOTIFICATION_COPY: Record<SessionKind, { title: string; body: string }> = {
  focus: { title: "Tapos na ang focus", body: "Break na. Balik ka muna dito." },
  shortBreak: { title: "Tapos na ang break", body: "Handa ka na bang bumalik?" },
  longBreak: { title: "Tapos na ang long break", body: "Tara, ulit tayo." },
};

export type PermissionState = NotificationPermission | "unsupported";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Permission lives on the browser, not in React, so components read it through
 * `useSyncExternalStore`. That also gives the server its own snapshot, so the
 * hint text hydrates without a mismatch.
 */
const permissionListeners = new Set<() => void>();

export function subscribeToPermission(onChange: () => void): () => void {
  permissionListeners.add(onChange);
  return () => {
    permissionListeners.delete(onChange);
  };
}

export function notificationPermission(): PermissionState {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

/** The server can't know; "unsupported" renders the most conservative hint. */
export function serverNotificationPermission(): PermissionState {
  return "unsupported";
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === "denied") return false;

  try {
    const granted =
      Notification.permission === "granted"
        ? true
        : (await Notification.requestPermission()) === "granted";
    // Only we can change it from inside the page, so this is the one place
    // that needs to tell subscribers to re-read.
    for (const listener of [...permissionListeners]) listener();
    return granted;
  } catch {
    return false;
  }
}

/**
 * Only fires when the page is hidden. If they're looking at it, the chime and
 * the UI have already said everything a notification would.
 */
export function notifySessionEnd(kind: SessionKind): void {
  if (!notificationsSupported()) return;
  if (Notification.permission !== "granted") return;
  if (document.visibilityState === "visible") return;

  try {
    const { title, body } = NOTIFICATION_COPY[kind];
    new Notification(title, { body, tag: "porolambing-session" });
  } catch {
    // Some browsers throw for Notification outside a service worker.
  }
}
