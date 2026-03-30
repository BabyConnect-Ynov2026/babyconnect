import homeLogo from '../../assets/img/logo-home-ynov.png'

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-8 text-center">
        <img
          src={homeLogo}
          alt="BabyConnect"
          className="w-full max-w-xs md:max-w-md h-auto"
        />
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Hello world
        </h1>
      </div>
    </main>
  )
}
