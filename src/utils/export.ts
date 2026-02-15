/**
 * Trigger download of a blob as a file.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Export canvas to PNG.
 */
export function exportCanvasToPNG(canvas: HTMLCanvasElement, filename = 'webescher.png'): void {
  canvas.toBlob(
    (blob) => {
      if (blob) downloadBlob(blob, filename)
    },
    'image/png',
    1
  )
}
