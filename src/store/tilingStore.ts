import { create } from 'zustand'
import type { Vector2D } from '../engine/types'
import {
  createHistory,
  pushHistory,
  undo as historyUndo,
  redo as historyRedo,
  canUndo as historyCanUndo,
  canRedo as historyCanRedo,
  type HistoryState,
} from '../editor/history'
import { getDefaultShapePoints } from '../utils/defaultShape'

const TILE_SIZE = 80
const DEFAULT_PALETTE = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a']

export type WallpaperGroupId =
  | 'p1'
  | 'p2'
  | 'pm'
  | 'pg'
  | 'cm'
  | 'pmm'
  | 'pmg'
  | 'pgg'
  | 'cmm'
  | 'p4'
  | 'p4m'
  | 'p4g'
  | 'p3'
  | 'p3m1'
  | 'p31m'
  | 'p6'
  | 'p6m'

export type BaseShapeId = 'square' | 'triangle' | 'hexagon'

interface TilingState {
  wallpaperGroup: WallpaperGroupId | null
  baseShape: BaseShapeId
  shapePoints: Vector2D[] | null
  history: HistoryState | null
  roleColors: string[]
  smoothEnabled: boolean
  smoothTension: number
  homothetyEnabled: boolean
  homothetyMode: 'horizontal' | 'border' | 'hole'
  setWallpaperGroup: (group: WallpaperGroupId | null) => void
  setBaseShape: (shape: BaseShapeId) => void
  setShapePoints: (points: Vector2D[]) => void
  setRoleColor: (index: number, color: string) => void
  getRoleColor: (index: number) => string
  setSmoothEnabled: (v: boolean) => void
  setSmoothTension: (v: number) => void
  setHomothetyEnabled: (v: boolean) => void
  setHomothetyMode: (v: 'horizontal' | 'border' | 'hole') => void
  resetShape: () => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

export const useTilingStore = create<TilingState>((set, get) => ({
  wallpaperGroup: null,
  baseShape: 'square',
  shapePoints: null,
  history: null,
  roleColors: [...DEFAULT_PALETTE],
  smoothEnabled: false,
  smoothTension: 0.5,
  homothetyEnabled: false,
  homothetyMode: 'horizontal',
  setWallpaperGroup: (wallpaperGroup) =>
    set({ wallpaperGroup, shapePoints: null, history: null }),
  setBaseShape: (baseShape) =>
    set({ baseShape, shapePoints: null, history: null }),
  setRoleColor: (index, color) => {
    const state = get()
    const next = [...state.roleColors]
    next[index] = color
    set({ roleColors: next })
  },
  getRoleColor: (index) => {
    const state = get()
    return state.roleColors[index] ?? DEFAULT_PALETTE[index % DEFAULT_PALETTE.length]
  },
  setSmoothEnabled: (smoothEnabled) => set({ smoothEnabled }),
  setSmoothTension: (smoothTension) => set({ smoothTension: Math.max(0, Math.min(1, smoothTension)) }),
  setHomothetyEnabled: (homothetyEnabled) => set({ homothetyEnabled }),
  setHomothetyMode: (homothetyMode) => set({ homothetyMode }),
  setShapePoints: (points) => {
    const state = get()
    const current =
      state.shapePoints ??
      getDefaultShapePoints(state.baseShape, TILE_SIZE)
    let nextHistory = state.history
    if (!nextHistory) {
      nextHistory = createHistory(current)
    }
    nextHistory = pushHistory(nextHistory, points)
    set({ shapePoints: points, history: nextHistory })
  },
  resetShape: () => set({ shapePoints: null, history: null, smoothEnabled: false }),
  undo: () => {
    const state = get()
    if (!state.history || !historyCanUndo(state.history)) return
    const next = historyUndo(state.history)!
    set({ shapePoints: next.present, history: next })
  },
  redo: () => {
    const state = get()
    if (!state.history || !historyCanRedo(state.history)) return
    const next = historyRedo(state.history)!
    set({ shapePoints: next.present, history: next })
  },
  canUndo: () => {
    const h = get().history
    return h !== null && historyCanUndo(h)
  },
  canRedo: () => {
    const h = get().history
    return h !== null && historyCanRedo(h)
  },
}))
