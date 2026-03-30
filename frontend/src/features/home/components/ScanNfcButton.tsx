import { ScanLine } from 'lucide-react'

export function ScanNfcButton() {
  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 flex justify-center bg-gradient-to-t from-white via-white/90 to-transparent px-4 pb-6 pt-12 sm:px-6 sm:pb-8 lg:justify-end lg:px-8 xl:px-16">
      <button
        type="button"
        className="pointer-events-auto inline-flex w-full max-w-sm items-center justify-center gap-3 rounded-full bg-[#1ad7b0] px-6 py-3 text-left text-slate-950 shadow-[0_24px_50px_rgba(26,215,176,0.38)] transition-transform hover:scale-[1.02] sm:w-auto sm:justify-start"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/30">
          <ScanLine size={24} />
        </span>
        <span className="leading-tight">
          <span className="block text-[0.7rem] font-black uppercase tracking-[0.24em]">
            Scanner
          </span>
          <span className="block text-base font-black">NFC</span>
        </span>
      </button>
    </div>
  )
}
