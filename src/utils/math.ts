import type { AffineTransform, Vector2D } from '../engine/types'

const IDENTITY: AffineTransform = [1, 0, 0, 0, 1, 0, 0, 0, 1]

/**
 * Identity transform.
 */
export function identity(): AffineTransform {
  return [...IDENTITY] as AffineTransform
}

/**
 * Multiply two 3x3 matrices (row-major).
 */
export function multiply(a: AffineTransform, b: AffineTransform): AffineTransform {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    0,
    0,
    1,
  ] as AffineTransform
}

/**
 * Apply affine transform to a point.
 */
export function applyToPoint(m: AffineTransform, p: Vector2D): Vector2D {
  return {
    x: m[0] * p.x + m[1] * p.y + m[2],
    y: m[3] * p.x + m[4] * p.y + m[5],
  }
}

/**
 * Compute inverse of an affine transform (assumes last row is 0,0,1).
 */
export function inverse(m: AffineTransform): AffineTransform {
  const det = m[0] * m[4] - m[1] * m[3]
  if (Math.abs(det) < 1e-12) {
    throw new Error('Singular matrix')
  }
  const invDet = 1 / det
  return [
    m[4] * invDet,
    -m[1] * invDet,
    (m[1] * m[5] - m[2] * m[4]) * invDet,
    -m[3] * invDet,
    m[0] * invDet,
    (m[2] * m[3] - m[0] * m[5]) * invDet,
    0,
    0,
    1,
  ] as AffineTransform
}

/**
 * Build translation matrix: (x, y) -> (x + tx, y + ty).
 */
export function translation(tx: number, ty: number): AffineTransform {
  return [1, 0, tx, 0, 1, ty, 0, 0, 1] as AffineTransform
}

/**
 * Build rotation matrix (counter-clockwise around origin): angle in radians.
 */
export function rotation(angle: number): AffineTransform {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [c, -s, 0, s, c, 0, 0, 0, 1] as AffineTransform
}

/**
 * Build scale matrix: (x, y) -> (sx*x, sy*y).
 */
export function scale(sx: number, sy: number): AffineTransform {
  return [sx, 0, 0, 0, sy, 0, 0, 0, 1] as AffineTransform
}

/**
 * Rotation around a point (cx, cy) by angle in radians (counter-clockwise).
 */
export function rotationAround(cx: number, cy: number, angle: number): AffineTransform {
  const T = translation(cx, cy)
  const R = rotation(angle)
  const Tinv = translation(-cx, -cy)
  return multiply(multiply(T, R), Tinv)
}

/**
 * Reflection in x-axis (y -> -y).
 */
export function reflectX(): AffineTransform {
  return [1, 0, 0, 0, -1, 0, 0, 0, 1] as AffineTransform
}

/**
 * Reflection in y-axis (x -> -x).
 */
export function reflectY(): AffineTransform {
  return [-1, 0, 0, 0, 1, 0, 0, 0, 1] as AffineTransform
}

/**
 * Compose: first apply b, then a. Result = a * b (matrix product).
 */
export function compose(a: AffineTransform, b: AffineTransform): AffineTransform {
  return multiply(a, b)
}

/**
 * Scale points around a center: P' = center + s * (P - center).
 */
export function scalePointsAroundCenter(
  points: Vector2D[],
  center: Vector2D,
  s: number
): Vector2D[] {
  return points.map((p) => ({
    x: center.x + s * (p.x - center.x),
    y: center.y + s * (p.y - center.y),
  }))
}
