import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { GroupSelector } from './GroupSelector'

describe('GroupSelector', () => {
  it('displays all 17 wallpaper groups', () => {
    render(<GroupSelector />)
    expect(screen.getByText(/p1 –/)).toBeInTheDocument()
    expect(screen.getByText(/p2 –/)).toBeInTheDocument()
    expect(screen.getByText(/p4 –/)).toBeInTheDocument()
    expect(screen.getByText(/p6m –/)).toBeInTheDocument()
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(17)
  })

  it('selects a group when a group button is clicked', async () => {
    const user = userEvent.setup()
    render(<GroupSelector />)
    const p4Button = screen.getByRole('button', { name: /p4 –/ })
    await user.click(p4Button)
    expect(p4Button).toHaveClass('bg-indigo-100')
  })
})
