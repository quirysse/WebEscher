import { describe, it, expect } from 'vitest'
import {
  identity,
  multiply,
  applyToPoint,
  inverse,
  translation,
  rotation,
  rotationAround,
  compose,
} from './math'

describe('math', () => {
  it('identity leaves point unchanged', () => {
    const I = identity()
    expect(applyToPoint(I, { x: 3, y: 4 })).toEqual({ x: 3, y: 4 })
  })

  it('translation moves point', () => {
    const T = translation(10, 20)
    expect(applyToPoint(T, { x: 0, y: 0 })).toEqual({ x: 10, y: 20 })
  })

  it('rotation 90 degrees around origin', () => {
    const R = rotation(Math.PI / 2)
    const p = applyToPoint(R, { x: 1, y: 0 })
    expect(p.x).toBeCloseTo(0)
    expect(p.y).toBeCloseTo(1)
  })

  it('inverse of translation', () => {
    const T = translation(5, -3)
    const Tinv = inverse(T)
    const p = applyToPoint(Tinv, applyToPoint(T, { x: 1, y: 1 }))
    expect(p.x).toBeCloseTo(1)
    expect(p.y).toBeCloseTo(1)
  })

  it('multiply and inverse compose to identity', () => {
    const T = translation(1, 2)
    const R = rotation(Math.PI / 4)
    const M = multiply(T, R)
    const Minv = inverse(M)
    const composed = multiply(M, Minv)
    const id = identity()
    expect(composed[0]).toBeCloseTo(id[0])
    expect(composed[4]).toBeCloseTo(id[4])
  })

  it('rotationAround rotates around point', () => {
    const R = rotationAround(1, 1, Math.PI)
    const p = applyToPoint(R, { x: 1, y: 1 })
    expect(p.x).toBeCloseTo(1)
    expect(p.y).toBeCloseTo(1)
  })

  it('compose is multiply', () => {
    const A = translation(1, 0)
    const B = translation(0, 1)
    expect(compose(A, B)).toEqual(multiply(A, B))
  })
})
