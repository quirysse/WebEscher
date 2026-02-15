import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { LanguageSwitcher } from './LanguageSwitcher'

describe('LanguageSwitcher', () => {
  it('shows EN when current language is French', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByRole('button', { name: /Switch to English|Passer en français/ })).toHaveTextContent('EN')
  })

  it('switches text when toggled', async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher />)
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('EN')
    await user.click(button)
    expect(button).toHaveTextContent('FR')
  })
})
