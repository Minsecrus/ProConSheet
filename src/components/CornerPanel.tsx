import type { ReactNode } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Check,
  Info,
  Languages,
  RefreshCcw,
  Save,
  TableProperties,
  X,
  type LucideIcon,
} from 'lucide-react'
type CornerPanelProps = {
  resetMode: boolean
  onBeginReset: () => void
  onCancelReset: () => void
  onConfirmReset: () => void
  onOpenSave: () => void
  onToggleLocale: () => void
  onOpenInfo: () => void
  copy: {
    resetConfirm: string
    resetLabel: string
    saveLabel: string
    languageLabel: string
    infoLabel: string
    cancelReset: string
    confirmReset: string
  }
}

type CornerActionProps = {
  label: ReactNode
  hoverLabel: string
  Icon: LucideIcon
  onClick: () => void
}

function CornerAction({ label, hoverLabel, Icon, onClick }: CornerActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-full w-full items-center justify-center overflow-hidden bg-white text-stone-700 transition duration-300 hover:bg-stone-50"
      aria-label={hoverLabel}
      title={hoverLabel}
    >
      <span className="text-sm font-semibold lowercase tracking-[0.06em] transition duration-300 group-hover:-translate-y-1.5 group-hover:opacity-0">
        {label}
      </span>
      <Icon className="pointer-events-none absolute size-5 translate-y-1.5 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100" />
    </button>
  )
}

export function CornerPanel({
  resetMode,
  onBeginReset,
  onCancelReset,
  onConfirmReset,
  onOpenSave,
  onToggleLocale,
  onOpenInfo,
  copy,
}: CornerPanelProps) {
  return (
    <section className="grid min-w-0 min-h-0 grid-cols-2 grid-rows-[1fr_1fr] bg-white">
      {resetMode ? (
        <>
          <button
            type="button"
            onClick={onCancelReset}
            className="flex items-center justify-center bg-white text-emerald-600 transition duration-300 hover:bg-emerald-50 hover:text-emerald-700"
            aria-label={copy.cancelReset}
            title={copy.cancelReset}
          >
            <X className="size-5 transition duration-300 hover:rotate-90" />
          </button>
          <button
            type="button"
            onClick={onConfirmReset}
            className="flex items-center justify-center bg-white text-rose-600 transition duration-300 hover:bg-rose-50 hover:text-rose-700"
            aria-label={copy.confirmReset}
            title={copy.confirmReset}
          >
            <Check className="size-5 transition duration-300 hover:scale-110" />
          </button>
          <div className="col-span-2 flex items-center justify-center px-2 text-center text-sm font-medium tracking-[0.04em] text-stone-700 transition duration-300">
            {copy.resetConfirm}
          </div>
        </>
      ) : (
        <>
          <div>
            <CornerAction
              label={
                <span className="inline-flex items-center gap-0.5">
                  <ArrowUp className="size-4.5 text-emerald-600" strokeWidth={2.4} />
                  <span>ro</span>
                </span>
              }
              hoverLabel={copy.resetLabel}
              Icon={RefreshCcw}
              onClick={onBeginReset}
            />
          </div>
          <div>
            <CornerAction
              label={
                <span className="inline-flex items-center gap-0.5">
                  <ArrowDown className="size-4.5 text-rose-600" strokeWidth={2.4} />
                  <span>on</span>
                </span>
              }
              hoverLabel={copy.saveLabel}
              Icon={Save}
              onClick={onOpenSave}
            />
          </div>
          <div className="group relative col-span-2 grid grid-cols-2">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center transition duration-300 group-hover:opacity-0">
              <span className="inline-flex items-center gap-0.5 text-sm font-semibold lowercase tracking-[0.06em] text-stone-700 transition duration-300 group-hover:-translate-y-1.5">
                <TableProperties
                  className="size-4.5 text-sky-600"
                  strokeWidth={2.2}
                />
                <span>heet</span>
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleLocale}
              className="flex items-center justify-center bg-white text-stone-700 transition duration-300 hover:bg-stone-50"
              aria-label={copy.languageLabel}
              title={copy.languageLabel}
            >
              <Languages className="size-5 -translate-x-1.5 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </button>
            <button
              type="button"
              onClick={onOpenInfo}
              className="flex items-center justify-center bg-white text-stone-700 transition duration-300 hover:bg-stone-50"
              aria-label={copy.infoLabel}
              title={copy.infoLabel}
            >
              <Info className="size-5 translate-x-1.5 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </button>
          </div>
        </>
      )}
    </section>
  )
}
