import homeLogo from '../../assets/img/logo-home-ynov.png'
import { babyfootCards, currentUser } from '../features/home/data'
import { BabyfootCard } from '../features/home/components/BabyfootCard'
import { HomeHeader } from '../features/home/components/HomeHeader'
import { HomeHero } from '../features/home/components/HomeHero'
import { ScanNfcButton } from '../features/home/components/ScanNfcButton'
import { useHomeState } from '../features/home/useHomeState'

export default function Home() {
  const { closeMenu, isMenuOpen, toggleMenu } = useHomeState()

  return (
    <main className="min-h-screen bg-[#f3f4ef] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-36 sm:px-6 lg:px-8">
        <HomeHeader
          currentUser={currentUser ? { name: currentUser.full_name, avatarUrl: currentUser.avatar_url} : null}
          isMenuOpen={isMenuOpen}
          logoSrc={homeLogo}
          onCloseMenu={closeMenu}
          onToggleMenu={toggleMenu}
        />

        <HomeHero />

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {babyfootCards.map((card) => (
            <BabyfootCard key={card.id} card={card} />
          ))}
        </section>
      </div>

      <ScanNfcButton />
    </main>
  )
}
