import { useEffect, useState } from 'react'
import { tablesApi } from '../../services/api'
import { mapLiveTableToCard } from './data'
import type { BabyfootCardData } from './types'
import type { LiveTable } from '../../types'

export function useHomeState() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cards, setCards] = useState<BabyfootCardData[]>([])
  const [isLoadingCards, setIsLoadingCards] = useState(true)
  const [cardsError, setCardsError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    let eventSource: EventSource | null = null

    const loadCards = async () => {
      try {
        setIsLoadingCards(true)
        setCardsError(null)

        const response = await tablesApi.getLive()
        if (isCancelled) {
          return
        }

        setCards((response.data.tables ?? []).map(mapLiveTableToCard))
      } catch {
        if (isCancelled) {
          return
        }

        setCardsError('Impossible de charger les tables pour le moment.')
      } finally {
        if (!isCancelled) {
          setIsLoadingCards(false)
        }
      }
    }

    loadCards()

    eventSource = new EventSource('/api/v1/tables/live/stream')
    eventSource.onmessage = (event) => {
      if (isCancelled) {
        return
      }

      try {
        const payload = JSON.parse(event.data) as { tables?: LiveTable[] }
        setCards((payload.tables ?? []).map(mapLiveTableToCard))
        setCardsError(null)
        setIsLoadingCards(false)
      } catch {
        setCardsError('Impossible de lire le flux temps reel des tables.')
      }
    }

    return () => {
      isCancelled = true
      eventSource?.close()
    }
  }, [])

  return {
    cards,
    cardsError,
    closeMenu: () => setIsMenuOpen(false),
    isMenuOpen,
    isLoadingCards,
    toggleMenu: () => setIsMenuOpen((open) => !open),
  }
}
