import { describe, it, expect, beforeEach } from 'vitest'
import { useTilingStore } from './tilingStore'

describe('tilingStore smooth state', () => {
  beforeEach(() => {
    useTilingStore.setState({
      smoothEnabled: false,
      smoothTension: 0.5,
    })
  })

  it('has default smoothEnabled false and smoothTension 0.5', () => {
    const state = useTilingStore.getState()
    expect(state.smoothEnabled).toBe(false)
    expect(state.smoothTension).toBe(0.5)
  })

  it('setSmoothEnabled updates smoothEnabled', () => {
    useTilingStore.getState().setSmoothEnabled(true)
    expect(useTilingStore.getState().smoothEnabled).toBe(true)
    useTilingStore.getState().setSmoothEnabled(false)
    expect(useTilingStore.getState().smoothEnabled).toBe(false)
  })

  it('setSmoothTension updates smoothTension and clamps to 0..1', () => {
    useTilingStore.getState().setSmoothTension(0.8)
    expect(useTilingStore.getState().smoothTension).toBe(0.8)
    useTilingStore.getState().setSmoothTension(1.5)
    expect(useTilingStore.getState().smoothTension).toBe(1)
    useTilingStore.getState().setSmoothTension(-0.2)
    expect(useTilingStore.getState().smoothTension).toBe(0)
  })

  it('resetShape sets smoothEnabled to false', () => {
    useTilingStore.getState().setSmoothEnabled(true)
    useTilingStore.getState().resetShape()
    expect(useTilingStore.getState().smoothEnabled).toBe(false)
  })
})
