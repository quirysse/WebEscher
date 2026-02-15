import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTilingStore } from '../../store/tilingStore'
import { generateTileInstances, transformPoint } from '../../engine/tileGenerator'
import { getDefaultShapePoints } from '../../utils/defaultShape'
import { updatePointAt, clampToTile } from '../../editor/shapeEditor'
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
  const dragRef = useRef<number | null>(null)
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

    for (const { transform, roleIndex } of instances) {
      const worldPoints = currentPoints.map((p) => transformPoint(transform, p))
      const hex = getRoleColor(roleIndex)
      ctx.fillStyle = hexToRgba(hex, 0.85)
      ctx.strokeStyle = 'rgba(51,51,77,1)'
      ctx.lineWidth = 2 / zoom
      ctx.beginPath()
      ctx.moveTo(worldPoints[0].x, worldPoints[0].y)
      for (let i = 1; i < worldPoints.length; i++) {
        ctx.lineTo(worldPoints[i].x, worldPoints[i].y)
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }

    // Editor outline (polyline; for splines: store control points and use
    // ctx.quadraticCurveTo / ctx.bezierCurveTo, or smooth via mid-edge quadraticCurveTo)
    ctx.strokeStyle = 'rgba(102,126,234,1)'
    ctx.lineWidth = 2.5 / zoom
    ctx.setLineDash([8, 4])
    ctx.beginPath()
    ctx.moveTo(currentPoints[0].x, currentPoints[0].y)
    for (let i = 1; i < currentPoints.length; i++) {
      ctx.lineTo(currentPoints[i].x, currentPoints[i].y)
    }
    ctx.closePath()
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
  }, [wallpaperGroup, baseShape, size.width, size.height, shapePoints, roleColors, getRoleColor, zoom, pan])

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
      if (canvasRef.current && wallpaperGroup) {
        exportCanvasToPNG(canvasRef.current, 'webescher.png')
      }
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
      const index = hitTestHandle(worldX, worldY)
      if (index !== null) {
        dragRef.current = index
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      if (dragRef.current === null) return
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const screenX = (e.clientX - rect.left) * scaleX
      const screenY = (e.clientY - rect.top) * scaleY
      const { x: worldX, y: worldY } = screenToWorld(screenX, screenY)
      const p = clampToTile({ x: worldX, y: worldY }, TILE_SIZE)
      const current = useTilingStore.getState().shapePoints ?? getDefaultShapePoints(useTilingStore.getState().baseShape, TILE_SIZE)
      const next = updatePointAt(current, dragRef.current, p)
      setShapePoints(next)
    }

    const onMouseUp = () => {
      dragRef.current = null
    }

    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [wallpaperGroup, setShapePoints])

  if (!wallpaperGroup) {
    return (
      <div className="flex h-full min-h-[600px] flex-1 flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-gray-50">
        <p className="text-center text-lg text-gray-500">{t('canvas.placeholder')}</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex h-full min-h-[600px] flex-1 flex-col rounded-lg border-2 border-gray-200 bg-gray-50"
      style={{ minWidth: 1, minHeight: 400 }}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full max-w-full"
        style={{ display: 'block', width: '100%', height: '100%', backgroundColor: '#e5e7eb' }}
      />
    </div>
  )
}
