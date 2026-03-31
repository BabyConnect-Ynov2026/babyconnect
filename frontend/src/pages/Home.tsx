import homeLogo from '../../assets/img/logo-home-ynov.png'
import { BabyfootCard } from '../features/home/components/BabyfootCard'
import { HomeHeader } from '../features/home/components/HomeHeader'
import { HomeHero } from '../features/home/components/HomeHero'
import { ScanNfcButton } from '../features/home/components/ScanNfcButton'
import { useHomeState } from '../features/home/useHomeState'

export default function Home() {
  const { cards, cardsError, closeMenu, isLoadingCards, isMenuOpen, toggleMenu } = useHomeState()

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
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {cardsError}
          </div>
        )}

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoadingCards
            ? Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="h-[280px] animate-pulse rounded-[28px] border border-black/5 bg-white/70 shadow-[0_22px_50px_rgba(15,23,42,0.08)]"
                />
              ))
            : cards.map((card) => <BabyfootCard key={card.id} card={card} />)}
        </section>

        {!isLoadingCards && cards.length === 0 && !cardsError && (
          <div className="mt-6 rounded-3xl border border-black/5 bg-white/80 px-5 py-6 text-sm font-semibold text-slate-600 shadow-[0_22px_50px_rgba(15,23,42,0.08)]">
            Aucune table n&apos;a ete trouvee dans la base.
          </div>
        )}
      </div>

      <ScanNfcButton />
    </main>
  )
}
