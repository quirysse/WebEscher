import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { ShapeSelector } from './ShapeSelector'

describe('ShapeSelector', () => {
  it('displays three base shapes', () => {
    render(<ShapeSelector />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
    expect(buttons.map((b) => b.textContent)).toContain('Carré')
    expect(buttons.map((b) => b.textContent)).toContain('Triangle')
    expect(buttons.map((b) => b.textContent)).toContain('Hexagone')
  })

  it('selects a shape when clicked', async () => {
    const user = userEvent.setup()
    render(<ShapeSelector />)
    const triangleButton = screen.getByRole('button', { name: 'Triangle' })
    await user.click(triangleButton)
    expect(triangleButton).toHaveClass('border-indigo-500')
  })
})
