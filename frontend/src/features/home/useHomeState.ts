import { useState } from 'react'

export function useHomeState() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return {
    closeMenu: () => setIsMenuOpen(false),
    isMenuOpen,
    toggleMenu: () => setIsMenuOpen((open) => !open),
  }
}
