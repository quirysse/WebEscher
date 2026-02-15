import { describe, it, expect } from 'vitest'
import { drawShapePath } from './smoothPath'

describe('drawShapePath', () => {
  const triangle = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 5, y: 10 },
  ]

  it('polygonal mode: calls moveTo, lineTo, closePath', () => {
    const calls: string[] = []
    const ctx = {
      beginPath: () => calls.push('beginPath'),
      moveTo: (_x: number, _y: number) => calls.push('moveTo'),
      lineTo: (_x: number, _y: number) => calls.push('lineTo'),
      quadraticCurveTo: () => calls.push('quadraticCurveTo'),
      closePath: () => calls.push('closePath'),
    }
    drawShapePath(ctx, triangle, false, 0.5)
    expect(calls).toEqual(['beginPath', 'moveTo', 'lineTo', 'lineTo', 'closePath'])
  })

  it('smooth mode: calls moveTo, quadraticCurveTo, closePath', () => {
    const calls: string[] = []
    const ctx = {
      beginPath: () => calls.push('beginPath'),
      moveTo: (_x: number, _y: number) => calls.push('moveTo'),
      lineTo: (_x: number, _y: number) => calls.push('lineTo'),
      quadraticCurveTo: () => calls.push('quadraticCurveTo'),
      closePath: () => calls.push('closePath'),
    }
    drawShapePath(ctx, triangle, true, 0.5)
    expect(calls[0]).toBe('beginPath')
    expect(calls[1]).toBe('moveTo')
    expect(calls.filter((c) => c === 'quadraticCurveTo')).toHaveLength(3)
    expect(calls[calls.length - 1]).toBe('closePath')
    expect(calls).not.toContain('lineTo')
  })

  it('does nothing for fewer than 3 points', () => {
    const calls: string[] = []
    const ctx = {
      beginPath: () => calls.push('beginPath'),
      moveTo: () => calls.push('moveTo'),
      lineTo: () => calls.push('lineTo'),
      quadraticCurveTo: () => calls.push('quadraticCurveTo'),
      closePath: () => calls.push('closePath'),
    }
    drawShapePath(ctx, [{ x: 0, y: 0 }, { x: 1, y: 0 }], false, 0.5)
    expect(calls).toHaveLength(0)
  })
})
