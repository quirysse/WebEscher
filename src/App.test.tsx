import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import './i18n'
import App from './App'

describe('App', () => {
  it('renders the application title', () => {
    render(<App />)
    expect(screen.getByText('WebEscher')).toBeInTheDocument()
  })
})
