"use client";

import type { PlayMode } from "./stores/player";

/** Bas ringkas: ayah card → AudioPlayer (satu <audio> global). */

export interface PlayRequest {
  chapterId: number;
  chapterName: string;
  verseKey: string;
  mode: PlayMode;
}

type Handler = (req: PlayRequest) => void;

const handlers = new Set<Handler>();

export function requestPlay(req: PlayRequest): void {
  handlers.forEach((h) => h(req));
}

export function onPlayRequest(h: Handler): () => void {
  handlers.add(h);
  return () => handlers.delete(h);
}

/** Saluran kawalan: card toggle/jeda pemain global tanpa akses <audio>. */
export type ControlAction = "toggle" | "pause" | "next" | "prev";

const controlHandlers = new Set<(a: ControlAction) => void>();

export function requestControl(action: ControlAction): void {
  controlHandlers.forEach((h) => h(action));
}

export function onControl(h: (a: ControlAction) => void): () => void {
  controlHandlers.add(h);
  return () => controlHandlers.delete(h);
}
