import type { ReactNode } from 'react'
import { X } from 'lucide-react'

type ModalProps = {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, description, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/35 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-stone-800/10 bg-white p-6 shadow-2xl shadow-stone-950/10">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-stone-900">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm leading-6 text-stone-600">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
