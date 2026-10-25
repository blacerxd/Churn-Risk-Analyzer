import { useState } from 'react'

const THEME_KEY = 'theme'

// The user's choice first, then prefers-color-scheme
export function readDark(): boolean {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'dark') return true
    if (stored === 'light') return false
  } catch {
    // storage is unavailable, fall back to the system theme
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
}

// One theme for the whole app, the login page included; the choice is kept in localStorage
export function useTheme(): [boolean, (next: boolean) => void] {
  const [dark, setDark] = useState(readDark)

  function setTheme(next: boolean) {
    setDark(next)
    applyTheme(next)
    try {
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light')
    } catch {
      // тема просто не сохранится
    }
  }

  return [dark, setTheme]
}
