"use client";

import { PIECES, type Piece } from "./library";

// A tiny client-side store so pieces created in one view survive client-side
// navigation to the /assets/[piece] route (until a real backend exists).
let runtime: Piece[] = [...PIECES];
const subs = new Set<() => void>();

export const piecesSnapshot = () => runtime;

export function getPiece(id: string): Piece | undefined {
  return runtime.find((p) => p.id === id);
}

export function addPiece(p: Piece) {
  runtime = [...runtime, p];
  subs.forEach((f) => f());
}

export function subscribePieces(fn: () => void) {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}
