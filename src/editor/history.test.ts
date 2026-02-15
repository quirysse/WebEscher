import { describe, it, expect } from 'vitest'
import {
  createHistory,
  pushHistory,
  undo,
  redo,
  canUndo,
  canRedo,
} from './history'

describe('history', () => {
  const initial = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ]

  it('createHistory sets present', () => {
    const h = createHistory(initial)
    expect(h.present).toEqual(initial)
    expect(h.past).toHaveLength(0)
    expect(h.future).toHaveLength(0)
  })

  it('pushHistory adds to past', () => {
    const h = createHistory(initial)
    const next = [...initial]
    next[0] = { x: 1, y: 1 }
    const h2 = pushHistory(h, next)
    expect(h2.past).toHaveLength(1)
    expect(h2.past[0]).toEqual(initial)
    expect(h2.present).toEqual(next)
  })

  it('undo restores previous', () => {
    const h = createHistory(initial)
    const next = [...initial]
    next[0] = { x: 1, y: 1 }
    const h2 = pushHistory(h, next)
    const h3 = undo(h2)
    expect(h3).not.toBeNull()
    expect(h3!.present).toEqual(initial)
  })

  it('redo re-applies', () => {
    const h = createHistory(initial)
    const next = [...initial]
    next[0] = { x: 1, y: 1 }
    const h2 = pushHistory(h, next)
    const h3 = undo(h2)!
    const h4 = redo(h3)!
    expect(h4.present).toEqual(next)
  })

  it('canUndo and canRedo', () => {
    const h = createHistory(initial)
    expect(canUndo(h)).toBe(false)
    expect(canRedo(h)).toBe(false)
    const h2 = pushHistory(h, [{ x: 1, y: 1 }, initial[1], initial[2]])
    expect(canUndo(h2)).toBe(true)
    const h3 = undo(h2)!
    expect(canRedo(h3)).toBe(true)
  })
})
