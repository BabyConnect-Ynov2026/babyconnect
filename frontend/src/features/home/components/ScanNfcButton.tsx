import { useState } from 'react'
import { ScanLine } from 'lucide-react'
import toast from 'react-hot-toast'

type NdefRecordLike = {
  data?: DataView | null
  recordType?: string
}

type NdefMessageLike = {
  records?: NdefRecordLike[]
}

type NdefReadingEventLike = Event & {
  message?: NdefMessageLike
}

type NdefReaderLike = {
  onreading: ((event: NdefReadingEventLike) => void) | null
  onreadingerror: ((event: Event) => void) | null
  scan: () => Promise<void>
}

type NdefReaderCtor = new () => NdefReaderLike

type ScanNfcButtonProps = {
  onTableScanned: (tableId: number) => void
}

const decodeRecordText = (record: NdefRecordLike): string => {
  if (!record.data) {
    return ''
  }

  const bytes = new Uint8Array(
    record.data.buffer,
    record.data.byteOffset,
    record.data.byteLength,
  )

  if (record.recordType === 'text' && bytes.length > 3) {
    const languageCodeLength = bytes[0] & 0x3f
    const payload = bytes.slice(1 + languageCodeLength)
    return new TextDecoder().decode(payload)
  }

  return new TextDecoder().decode(bytes)
}

const extractTableId = (value: string): number | null => {
  const fromQuery = value.match(/[?&]table=(\d+)/i)
  if (fromQuery) {
    return Number(fromQuery[1])
  }

  const fromPath = value.match(/\/reserve\/(\d+)/i)
  if (fromPath) {
    return Number(fromPath[1])
  }

  const onlyNumber = value.trim().match(/^(\d+)$/)
  if (onlyNumber) {
    return Number(onlyNumber[1])
  }

  return null
}

export function ScanNfcButton({ onTableScanned }: ScanNfcButtonProps) {
  const [isScanning, setIsScanning] = useState(false)

  const handleScan = async () => {
    if (isScanning) {
      return
    }

    if (!window.isSecureContext) {
      toast.error('Le scan NFC web demande HTTPS (ou localhost).')
      return
    }

    const ctor = (window as Window & { NDEFReader?: NdefReaderCtor }).NDEFReader
    if (!ctor) {
      toast.error('Web NFC non supporte sur ce navigateur.')
      return
    }

    try {
      const reader = new ctor()

      reader.onreadingerror = () => {
        toast.error('Erreur de lecture NFC. Reessaie.')
        setIsScanning(false)
      }

      reader.onreading = (event) => {
        const tableId = (event.message?.records ?? [])
          .map((record) => decodeRecordText(record))
          .map((value) => value.trim())
          .map((value) => extractTableId(value))
          .find((value): value is number => Boolean(value && value > 0))

        setIsScanning(false)

        if (!tableId) {
          toast.error('Carte NFC detectee, mais table introuvable.')
          return
        }

        toast.success(`Carte NFC detectee: table ${tableId}`)
        onTableScanned(tableId)
      }

      await reader.scan()
      setIsScanning(true)
      toast.success('Scan NFC actif. Approche la carte du babyfoot.')
    } catch {
      setIsScanning(false)
      toast.error('Activation NFC refusee ou indisponible.')
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 flex justify-center bg-gradient-to-t from-white via-white/90 to-transparent px-4 pb-6 pt-12 sm:px-6 sm:pb-8 lg:justify-end lg:px-8 xl:px-16">
      <button
        type="button"
        onClick={handleScan}
        disabled={isScanning}
        className="pointer-events-auto inline-flex w-full max-w-sm items-center justify-center gap-3 rounded-full bg-[#1ad7b0] px-6 py-3 text-left text-slate-950 shadow-[0_24px_50px_rgba(26,215,176,0.38)] transition-transform hover:scale-[1.02] sm:w-auto sm:justify-start"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/30">
          <ScanLine size={24} />
        </span>
        <span className="leading-tight">
          <span className="block text-base font-black">Scanner QRcode</span>
        </span>
      </button>
    </div>
  )
}
