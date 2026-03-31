import { useState } from 'react'
import homeLogo from '../../assets/img/logo-home-ynov.png'
import { ReservationModal } from '../components/ReservationModal'
import { BabyfootCard } from '../features/home/components/BabyfootCard'
import { HomeHeader } from '../features/home/components/HomeHeader'
import { HomeHero } from '../features/home/components/HomeHero'
import { ScanNfcButton } from '../features/home/components/ScanNfcButton'
import { useHomeState } from '../features/home/useHomeState'
import type { Table } from '../types'

export default function Home() {
  const [reservingTable, setReservingTable] = useState<Table | null>(null)
  const {
    cards,
    cardsError,
    closeMenu,
    isLoadingCards,
    isMenuOpen,
    toggleMenu,
  } = useHomeState()

  return (
    <main className="min-h-screen bg-[#f3f4ef] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-36 sm:px-6 lg:px-8">
        <HomeHeader
          currentUser={null}
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
                  onClick={() =>
                    setReservingTable({
                      available: card.status === 'free',
                      id: card.id,
                      location: card.location,
                      name: card.name,
                    })
                  }
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

      <ScanNfcButton />

      {reservingTable && (
        <ReservationModal
          table={reservingTable}
          onClose={() => setReservingTable(null)}
        />
      )}
    </main>
  )
}
