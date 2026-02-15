import '@testing-library/jest-dom'
import '../i18n'
import { vi } from 'vitest'

vi.mock('paper', () => {
  class Point {
    x: number
    y: number
    constructor(x: number, y: number) {
      this.x = x
      this.y = y
    }
  }
  return {
    default: {
      setup: vi.fn(),
      project: { clear: vi.fn(), view: { viewSize: { width: 400, height: 400 }, draw: vi.fn() } },
      Path: class Path {},
      Point,
      Matrix: class Matrix {},
      Color: class Color {},
      view: { draw: vi.fn() },
      Size: class Size {},
    },
  }
})
