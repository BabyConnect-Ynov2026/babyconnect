import { useState } from 'react'
import toast from 'react-hot-toast'
import homeLogo from '../../assets/img/logo-home-ynov.png'
import { ReservationModal } from '../components/ReservationModal'
import { BabyfootCard } from '../features/home/components/BabyfootCard'
import { HomeHeader } from '../features/home/components/HomeHeader'
import { HomeHero } from '../features/home/components/HomeHero'
import { ScanNfcButton } from '../features/home/components/ScanNfcButton'
import { useAuth } from '../features/auth/useAuth'
import { useHomeState } from '../features/home/useHomeState'
import { reservationsApi } from '../services/api'
import type { Table } from '../types'
import type { BabyfootCardData } from '../features/home/types'

const SLOT_DURATION_MINUTES = 15

function toReservationTable(card: BabyfootCardData): Table {
  return {
    available: card.status === 'free',
    id: card.id,
    location: card.location,
    name: card.name,
  }
}

function getNextReservationSlot(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now)
  start.setSeconds(0, 0)

  const minutes = start.getMinutes()
  const nextQuarter = Math.ceil((minutes + 1) / SLOT_DURATION_MINUTES) * SLOT_DURATION_MINUTES
  start.setMinutes(nextQuarter)

  const end = new Date(start.getTime() + SLOT_DURATION_MINUTES * 60 * 1000)
  return { end, start }
}

export default function Home() {
  const [reservingTable, setReservingTable] = useState<Table | null>(null)
  const [isAutoReserving, setIsAutoReserving] = useState(false)
  const { user } = useAuth()
  const {
    cards,
    cardsError,
    closeMenu,
    isLoadingCards,
    isMenuOpen,
    toggleMenu,
  } = useHomeState()

  const openReservationModal = (card: BabyfootCardData) => {
    setReservingTable(toReservationTable(card))
  }

  const handleScannedTable = async (tableId: number) => {
    const scannedCard = cards.find((card) => card.id === tableId)
    if (!scannedCard) {
      toast.error('Table non trouvee. Verifie la carte NFC.')
      return
    }

    if (scannedCard.status !== 'free') {
      toast('Cette table est deja reservee ou occupee. Choisis un creneau.')
      openReservationModal(scannedCard)
      return
    }

    if (!user) {
      toast('Connecte-toi pour reserver automatiquement.')
      openReservationModal(scannedCard)
      return
    }

    setIsAutoReserving(true)
    const { end, start } = getNextReservationSlot()

    try {
      await reservationsApi.create({
        end_time: end.toISOString(),
        notes: 'Reservation automatique via carte NFC',
        player_id: user.id,
        start_time: start.toISOString(),
        table_id: scannedCard.id,
      })
      toast.success(`Table ${scannedCard.name} reservee automatiquement.`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Reservation auto impossible. Choisis un creneau.')
      openReservationModal(scannedCard)
    } finally {
      setIsAutoReserving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f4ef] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-36 sm:px-6 lg:px-8">
        <HomeHeader
          isMenuOpen={isMenuOpen}
          logoSrc={homeLogo}
          onCloseMenu={closeMenu}
          onToggleMenu={toggleMenu}
        />

        <HomeHero />

        {cardsError && (
          <div className="mt-6 rounded-3xl border border-red-100 bg-red-50/90 px-5 py-4 text-sm font-semibold text-red-700 shadow-[0_22px_50px_rgba(15,23,42,0.08)]">
            {cardsError}
          </div>
        )}

        {isLoadingCards && (
          <div className="mt-6 rounded-3xl border border-black/5 bg-white/80 px-5 py-6 text-sm font-semibold text-slate-600 shadow-[0_22px_50px_rgba(15,23,42,0.08)]">
            Chargement des tables...
          </div>
        )}

        {!isLoadingCards && cards.length > 0 && (
          <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <div key={card.id} className="flex h-full flex-col gap-3">
                <BabyfootCard card={card} />
                <button
                  type="button"
                  onClick={() => openReservationModal(card)}
                  className="w-full rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-white transition-all hover:bg-emerald-600"
                >
                  Réserver cette table
                </button>
              </div>
            ))}
          </section>
        )}

        {!isLoadingCards && cards.length === 0 && !cardsError && (
          <div className="mt-6 rounded-3xl border border-black/5 bg-white/80 px-5 py-6 text-sm font-semibold text-slate-600 shadow-[0_22px_50px_rgba(15,23,42,0.08)]">
            Aucune table n&apos;a été trouvée dans la base.
          </div>
        )}
      </div>

      <ScanNfcButton onTableScanned={handleScannedTable} />

      {isAutoReserving && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
          <div className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-[0_22px_50px_rgba(15,23,42,0.2)]">
            Reservation NFC en cours...
          </div>
        </div>
      )}

      {reservingTable && (
        <ReservationModal
          table={reservingTable}
          onClose={() => setReservingTable(null)}
        />
      )}
    </main>
  )
}
