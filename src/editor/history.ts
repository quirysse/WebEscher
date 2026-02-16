import type { Vector2D } from '../engine/types'

const MAX_HISTORY = 50

export interface HistoryState {
  past: Vector2D[][]
  present: Vector2D[]
  future: Vector2D[][]
}

export function createHistory(initial: Vector2D[]): HistoryState {
  return {
    past: [],
    present: initial,
    future: [],
  }
}

export function pushHistory(state: HistoryState, next: Vector2D[]): HistoryState {
  if (state.present.length === next.length) {
    let same = true
    for (let i = 0; i < next.length; i++) {
      if (state.present[i].x !== next[i].x || state.present[i].y !== next[i].y) {
        same = false
        break
      }
    }
    if (same) return state
  }

  const past = [...state.past, state.present]
  if (past.length > MAX_HISTORY) past.shift()
  return {
    past,
    present: next.map((p) => ({ x: p.x, y: p.y })),
    future: [],
  }
}

export function undo(state: HistoryState): HistoryState | null {
  if (state.past.length === 0) return null
  const past = state.past.slice(0, -1)
  const present = state.past[state.past.length - 1]
  const future = [...state.future, state.present]
  return { past, present, future }
}

export function redo(state: HistoryState): HistoryState | null {
  if (state.future.length === 0) return null
  const past = [...state.past, state.present]
  const present = state.future[state.future.length - 1]
  const future = state.future.slice(0, -1)
  return { past, present, future }
}

export function canUndo(state: HistoryState): boolean {
  return state.past.length > 0
}

export function canRedo(state: HistoryState): boolean {
  return state.future.length > 0
}
