import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTilingStore } from '../../store/tilingStore'
import { generateTileInstances, transformPoint } from '../../engine/tileGenerator'
import { drawShapePath } from '../../engine/smoothPath'
import { scalePointsAroundCenter } from '../../utils/math'
import { getDefaultShapePoints } from '../../utils/defaultShape'
import { updatePointAt, clampToTile, insertPointAt, hitTestEdge } from '../../editor/shapeEditor'
import { applyConstraints, getEdgeConstraints } from '../../engine/constraints'
import { applyToPoint, inverse } from '../../utils/math'
import { exportCanvasToPNG } from '../../utils/export'
import { EXPORT_PNG_EVENT } from '../Sidebar/Toolbar'
import type { Vector2D } from '../../engine/types'

const TILE_SIZE = 100
const HANDLE_RADIUS = 10
const MIN_ZOOM = 0.2
const MAX_ZOOM = 4
const ZOOM_SENSITIVITY = 0.001

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export function TilingCanvas() {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const wallpaperGroup = useTilingStore((s) => s.wallpaperGroup)
  const baseShape = useTilingStore((s) => s.baseShape)
  const shapePoints = useTilingStore((s) => s.shapePoints)
  const setShapePoints = useTilingStore((s) => s.setShapePoints)
  const getRoleColor = useTilingStore((s) => s.getRoleColor)
  const roleColors = useTilingStore((s) => s.roleColors)
  const smoothEnabled = useTilingStore((s) => s.smoothEnabled)
  const smoothTension = useTilingStore((s) => s.smoothTension)
  const homothetyEnabled = useTilingStore((s) => s.homothetyEnabled)
  const homothetyMode = useTilingStore((s) => s.homothetyMode)
  const dragRef = useRef<number | null>(null)
  const panDragRef = useRef<{ startScreenX: number; startScreenY: number; startPan: { x: number; y: number } } | null>(null)
  const pinchRef = useRef<{
    distance: number
    centerScreenX: number
    centerScreenY: number
    startZoom: number
    startPan: { x: number; y: number }
  } | null>(null)
  const [viewState, setViewState] = useState({
    zoom: 1,
    pan: { x: TILE_SIZE / 2, y: TILE_SIZE / 2 },
  })
  const zoomPanRef = useRef({
    zoom: 1,
    pan: { x: TILE_SIZE / 2, y: TILE_SIZE / 2 },
  })
  const zoom = viewState.zoom
  const pan = viewState.pan

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const updateSize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (w > 0 && h > 0) setSize({ width: w, height: h })
    }
    const ro = new ResizeObserver(updateSize)
    ro.observe(container)
    updateSize()
    const t1 = window.setTimeout(updateSize, 0)
    const t2 = window.setTimeout(updateSize, 100)
    return () => {
      ro.disconnect()
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [wallpaperGroup])

  zoomPanRef.current = { zoom, pan }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !wallpaperGroup) return

    const width = size.width > 0 ? size.width : 800
    const height = size.height > 0 ? size.height : 600
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cx = width / 2
    const cy = height / 2
    const margin = TILE_SIZE * 4
    const viewport = {
      left: pan.x - cx / zoom - margin,
      top: pan.y - cy / zoom - margin,
      width: width / zoom + margin * 2,
      height: height / zoom + margin * 2,
    }

    const currentPoints = shapePoints ?? getDefaultShapePoints(baseShape, TILE_SIZE)
    const instances = generateTileInstances(wallpaperGroup, TILE_SIZE, viewport)

    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(0, 0, width, height)

    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(zoom, zoom)
    ctx.translate(-pan.x, -pan.y)

    const cellCenterProto = { x: TILE_SIZE / 2, y: TILE_SIZE / 2 }
    const HOMOTHETY_STRENGTH = 0.0012
    const HOMOTHETY_RADIUS = 250

    function getTileScale(tileCx: number, tileCy: number): number {
      if (!homothetyEnabled) return 1
      const dx = tileCx - pan.x
      const dy = tileCy - pan.y
      const dist = Math.hypot(dx, dy)
      switch (homothetyMode) {
        case 'horizontal':
          return Math.max(0.15, 1 - HOMOTHETY_STRENGTH * dx)
        case 'border':
          return Math.max(0.2, 1 - (dist / HOMOTHETY_RADIUS) * 0.8)
        case 'hole':
          return Math.min(1, 0.2 + (dist / HOMOTHETY_RADIUS) * 0.8)
        default:
          return 1
      }
    }

    for (const { transform, roleIndex } of instances) {
      const worldPoints = currentPoints.map((p) => transformPoint(transform, p))
      const centerWorld = transformPoint(transform, cellCenterProto)
      const scale = getTileScale(centerWorld.x, centerWorld.y)
      const pointsToDraw = scale !== 1 ? scalePointsAroundCenter(worldPoints, centerWorld, scale) : worldPoints
      const hex = getRoleColor(roleIndex)
      ctx.fillStyle = hexToRgba(hex, 0.85)
      ctx.strokeStyle = 'rgba(51,51,77,1)'
      ctx.lineWidth = 2 / zoom
      drawShapePath(ctx, pointsToDraw, smoothEnabled, smoothTension)
      ctx.fill()
      ctx.stroke()
    }

    ctx.strokeStyle = 'rgba(102,126,234,1)'
    ctx.lineWidth = 2.5 / zoom
    ctx.setLineDash([8, 4])
    drawShapePath(ctx, currentPoints, smoothEnabled, smoothTension)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#1a1a2e'
    ctx.lineWidth = 2.5 / zoom
    for (let i = 0; i < currentPoints.length; i++) {
      ctx.beginPath()
      ctx.arc(currentPoints[i].x, currentPoints[i].y, HANDLE_RADIUS, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    ctx.restore()
  }, [wallpaperGroup, baseShape, size.width, size.height, shapePoints, roleColors, getRoleColor, zoom, pan, smoothEnabled, smoothTension, homothetyEnabled, homothetyMode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !wallpaperGroup) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const screenX = (e.clientX - rect.left) * scaleX
      const screenY = (e.clientY - rect.top) * scaleY
      const cx = canvas.width / 2
      const cy = canvas.height / 2

      setViewState((prev) => {
        const newZoom = Math.min(
          MAX_ZOOM,
          Math.max(MIN_ZOOM, prev.zoom * (1 - e.deltaY * ZOOM_SENSITIVITY))
        )
        const worldX = (screenX - cx) / prev.zoom + prev.pan.x
        const worldY = (screenY - cy) / prev.zoom + prev.pan.y
        return {
          zoom: newZoom,
          pan: {
            x: worldX - (screenX - cx) / newZoom,
            y: worldY - (screenY - cy) / newZoom,
          },
        }
      })
    }

    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [wallpaperGroup])

  useEffect(() => {
    const onExport = () => {
      const canvas = canvasRef.current
      if (!canvas || !wallpaperGroup) return
      const width = canvas.width
      const height = canvas.height
      const state = useTilingStore.getState()
      const currentPoints = state.shapePoints ?? getDefaultShapePoints(state.baseShape, TILE_SIZE)
      const { zoom, pan } = zoomPanRef.current
      const cx = width / 2
      const cy = height / 2
      const margin = TILE_SIZE * 4
      const viewport = {
        left: pan.x - cx / zoom - margin,
        top: pan.y - cy / zoom - margin,
        width: width / zoom + margin * 2,
        height: height / zoom + margin * 2,
      }
      const instances = generateTileInstances(wallpaperGroup, TILE_SIZE, viewport)
      const cellCenterProto = { x: TILE_SIZE / 2, y: TILE_SIZE / 2 }
      const HOMOTHETY_STRENGTH = 0.0012
      const HOMOTHETY_RADIUS = 250

      function getTileScaleExport(tileCx: number, tileCy: number): number {
        if (!state.homothetyEnabled) return 1
        const dx = tileCx - pan.x
        const dy = tileCy - pan.y
        const dist = Math.hypot(dx, dy)
        switch (state.homothetyMode) {
          case 'horizontal':
            return Math.max(0.15, 1 - HOMOTHETY_STRENGTH * dx)
          case 'border':
            return Math.max(0.2, 1 - (dist / HOMOTHETY_RADIUS) * 0.8)
          case 'hole':
            return Math.min(1, 0.2 + (dist / HOMOTHETY_RADIUS) * 0.8)
          default:
            return 1
        }
      }

      const off = document.createElement('canvas')
      off.width = width
      off.height = height
      const ctx = off.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = '#e5e7eb'
      ctx.fillRect(0, 0, width, height)
      ctx.save()
      ctx.translate(cx, cy)
      ctx.scale(zoom, zoom)
      ctx.translate(-pan.x, -pan.y)

      for (const { transform, roleIndex } of instances) {
        const worldPoints = currentPoints.map((p) => transformPoint(transform, p))
        const centerWorld = transformPoint(transform, cellCenterProto)
        const scale = getTileScaleExport(centerWorld.x, centerWorld.y)
        const pointsToDraw = scale !== 1 ? scalePointsAroundCenter(worldPoints, centerWorld, scale) : worldPoints
        const hex = state.getRoleColor(roleIndex)
        ctx.fillStyle = hexToRgba(hex, 0.85)
        ctx.strokeStyle = 'rgba(51,51,77,1)'
        ctx.lineWidth = 2 / zoom
        drawShapePath(ctx, pointsToDraw, state.smoothEnabled, state.smoothTension)
        ctx.fill()
        ctx.stroke()
      }
      ctx.restore()
      exportCanvasToPNG(off, 'webescher.png')
    }
    window.addEventListener(EXPORT_PNG_EVENT, onExport)
    return () => window.removeEventListener(EXPORT_PNG_EVENT, onExport)
  }, [wallpaperGroup])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !wallpaperGroup) return

    const getCurrentPoints = (): Vector2D[] => {
      const state = useTilingStore.getState()
      return state.shapePoints ?? getDefaultShapePoints(state.baseShape, TILE_SIZE)
    }

    const screenToWorld = (screenX: number, screenY: number): Vector2D => {
      const { zoom, pan } = zoomPanRef.current
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      return {
        x: (screenX - cx) / zoom + pan.x,
        y: (screenY - cy) / zoom + pan.y,
      }
    }

    const hitTestHandle = (worldX: number, worldY: number): number | null => {
      const currentPoints = getCurrentPoints()
      for (let i = 0; i < currentPoints.length; i++) {
        const dx = worldX - currentPoints[i].x
        const dy = worldY - currentPoints[i].y
        if (dx * dx + dy * dy <= HANDLE_RADIUS * HANDLE_RADIUS) return i
      }
      return null
    }

    const onMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const screenX = (e.clientX - rect.left) * scaleX
      const screenY = (e.clientY - rect.top) * scaleY
      const { x: worldX, y: worldY } = screenToWorld(screenX, screenY)
      const handleIndex = hitTestHandle(worldX, worldY)
      if (handleIndex !== null) {
        dragRef.current = handleIndex
        return
      }
      const currentPoints = getCurrentPoints()
      const edgeHit = hitTestEdge(currentPoints, worldX, worldY)
      if (edgeHit !== null) {
        const clamped = clampToTile(edgeHit.projectedPoint, TILE_SIZE)
        let next = insertPointAt(currentPoints, edgeHit.edgeIndex, clamped)
        const constraints = getEdgeConstraints(wallpaperGroup, TILE_SIZE)
        if (constraints.length > 0 && currentPoints.length === 4) {
          const i = edgeHit.edgeIndex
          const segEnd = (i + 1) % 4
          for (const { edgeA, edgeB, transform } of constraints) {
            const [cA0, cA1] = edgeA
            const [cB0, cB1] = edgeB
            if (cA0 === i && cA1 === segEnd) {
              next = insertPointAt(next, cB0, applyToPoint(transform, clamped))
              break
            }
            if (cB0 === i && cB1 === segEnd) {
              next = insertPointAt(next, cA0, applyToPoint(inverse(transform), clamped))
              break
            }
          }
        }
        setShapePoints(next)
        dragRef.current = edgeHit.edgeIndex + 1
        return
      }
      const { pan } = zoomPanRef.current
      panDragRef.current = { startScreenX: screenX, startScreenY: screenY, startPan: { ...pan } }
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const screenX = (e.clientX - rect.left) * scaleX
      const screenY = (e.clientY - rect.top) * scaleY
      const pd = panDragRef.current
      if (pd) {
        const zoom = zoomPanRef.current.zoom
        setViewState((prev) => ({
          ...prev,
          pan: {
            x: pd.startPan.x - (screenX - pd.startScreenX) / zoom,
            y: pd.startPan.y - (screenY - pd.startScreenY) / zoom,
          },
        }))
        return
      }
      if (dragRef.current === null) return
      const { x: worldX, y: worldY } = screenToWorld(screenX, screenY)
      const p = clampToTile({ x: worldX, y: worldY }, TILE_SIZE)
      const current = useTilingStore.getState().shapePoints ?? getDefaultShapePoints(useTilingStore.getState().baseShape, TILE_SIZE)
      const cornerIndices = current.length === 6 ? ([0, 1, 3, 4] as [number, number, number, number]) : undefined
      const next = applyConstraints(current, dragRef.current, p, wallpaperGroup, TILE_SIZE, cornerIndices)
      setShapePoints(next)
    }

    const onMouseUp = () => {
      panDragRef.current = null
      dragRef.current = null
    }

    const getTouchScreenCoords = (touch: Touch) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      return {
        screenX: (touch.clientX - rect.left) * scaleX,
        screenY: (touch.clientY - rect.top) * scaleY,
      }
    }

    const getPinchDistance = (t1: Touch, t2: Touch) => {
      return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
    }

    const getPinchCenter = (t1: Touch, t2: Touch) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const cx = (t1.clientX + t2.clientX) / 2
      const cy = (t1.clientY + t2.clientY) / 2
      return {
        screenX: (cx - rect.left) * scaleX,
        screenY: (cy - rect.top) * scaleY,
      }
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const { zoom, pan } = zoomPanRef.current
        const distance = getPinchDistance(e.touches[0], e.touches[1])
        const center = getPinchCenter(e.touches[0], e.touches[1])
        pinchRef.current = {
          distance,
          centerScreenX: center.screenX,
          centerScreenY: center.screenY,
          startZoom: zoom,
          startPan: { ...pan },
        }
        dragRef.current = null
      }
      else if (e.touches.length === 1 && !pinchRef.current) {
        const { screenX, screenY } = getTouchScreenCoords(e.touches[0])
        const { x: worldX, y: worldY } = screenToWorld(screenX, screenY)
        const handleIndex = hitTestHandle(worldX, worldY)
        if (handleIndex !== null) {
          dragRef.current = handleIndex
        }
        else {
          const currentPoints = getCurrentPoints()
          const edgeHit = hitTestEdge(currentPoints, worldX, worldY)
          if (edgeHit !== null) {
            const clamped = clampToTile(edgeHit.projectedPoint, TILE_SIZE)
            let next = insertPointAt(currentPoints, edgeHit.edgeIndex, clamped)
            const constraints = getEdgeConstraints(wallpaperGroup, TILE_SIZE)
            if (constraints.length > 0 && currentPoints.length === 4) {
              const i = edgeHit.edgeIndex
              const segEnd = (i + 1) % 4
              for (const { edgeA, edgeB, transform } of constraints) {
                const [cA0, cA1] = edgeA
                const [cB0, cB1] = edgeB
                if (cA0 === i && cA1 === segEnd) {
                  next = insertPointAt(next, cB0, applyToPoint(transform, clamped))
                  break
                }
                if (cB0 === i && cB1 === segEnd) {
                  next = insertPointAt(next, cA0, applyToPoint(inverse(transform), clamped))
                  break
                }
              }
            }
            setShapePoints(next)
            dragRef.current = edgeHit.edgeIndex + 1
          }
          else {
            const { pan } = zoomPanRef.current
            panDragRef.current = { startScreenX: screenX, startScreenY: screenY, startPan: { ...pan } }
          }
        }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault()
        const pinch = pinchRef.current
        const currentDistance = getPinchDistance(e.touches[0], e.touches[1])
        const center = getPinchCenter(e.touches[0], e.touches[1])
        const cx = canvas.width / 2
        const cy = canvas.height / 2
        const ratio = currentDistance / pinch.distance
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinch.startZoom * ratio))
        const worldX = (pinch.centerScreenX - cx) / pinch.startZoom + pinch.startPan.x
        const worldY = (pinch.centerScreenY - cy) / pinch.startZoom + pinch.startPan.y
        setViewState({
          zoom: newZoom,
          pan: {
            x: worldX - (center.screenX - cx) / newZoom,
            y: worldY - (center.screenY - cy) / newZoom,
          },
        })
      }
      else if (e.touches.length === 1) {
        const pd = panDragRef.current
        if (pd) {
          e.preventDefault()
          const { screenX, screenY } = getTouchScreenCoords(e.touches[0])
          const zoom = zoomPanRef.current.zoom
          setViewState((prev) => ({
            ...prev,
            pan: {
              x: pd.startPan.x - (screenX - pd.startScreenX) / zoom,
              y: pd.startPan.y - (screenY - pd.startScreenY) / zoom,
            },
          }))
        }
        else if (dragRef.current !== null) {
          e.preventDefault()
          const { screenX, screenY } = getTouchScreenCoords(e.touches[0])
          const { x: worldX, y: worldY } = screenToWorld(screenX, screenY)
          const p = clampToTile({ x: worldX, y: worldY }, TILE_SIZE)
          const current = useTilingStore.getState().shapePoints ?? getDefaultShapePoints(useTilingStore.getState().baseShape, TILE_SIZE)
          const cornerIndices = current.length === 6 ? ([0, 1, 3, 4] as [number, number, number, number]) : undefined
          const next = applyConstraints(current, dragRef.current, p, wallpaperGroup, TILE_SIZE, cornerIndices)
          setShapePoints(next)
        }
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchRef.current = null
      }
      if (e.touches.length === 0) {
        panDragRef.current = null
        dragRef.current = null
      }
    }

    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd, { passive: false })
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: false })
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      canvas.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [wallpaperGroup, setShapePoints])

  if (!wallpaperGroup) {
    return (
      <div className="flex h-full min-h-[300px] flex-1 flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-gray-50 sm:min-h-[400px]">
        <p className="text-center text-base text-gray-500 sm:text-lg">{t('canvas.placeholder')}</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="touch-none flex h-full min-h-[300px] flex-1 flex-col rounded-lg border-2 border-gray-200 bg-gray-50 sm:min-h-[400px]"
      style={{ minWidth: 1, minHeight: 200 }}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full max-w-full touch-none"
        style={{ display: 'block', width: '100%', height: '100%', backgroundColor: '#e5e7eb' }}
      />
    </div>
  )
}
