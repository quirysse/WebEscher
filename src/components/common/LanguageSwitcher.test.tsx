import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { LanguageSwitcher } from './LanguageSwitcher'

describe('LanguageSwitcher', () => {
  it('renders a language select with options', () => {
    render(<LanguageSwitcher />)
    const select = screen.getByRole('combobox', { name: 'Language' })
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /EN/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /FR/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /IT/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /ES/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /JA/ })).toBeInTheDocument()
  })

  it('changes language when selecting another option', async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher />)
    const select = screen.getByRole('combobox', { name: 'Language' })
    await user.selectOptions(select, 'en')
    expect(select).toHaveValue('en')
    await user.selectOptions(select, 'ja')
    expect(select).toHaveValue('ja')
  })
})
