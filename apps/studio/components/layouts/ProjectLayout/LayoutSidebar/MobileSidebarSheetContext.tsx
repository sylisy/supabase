import type { PropsWithChildren } from 'react'
import { createContext, useContext, useState } from 'react'

type MobileSidebarSheetContextValue = {
  isOpen: boolean
  setOpen: (open: boolean) => void
}

const MobileSidebarSheetContext = createContext<MobileSidebarSheetContextValue | null>(null)

export function MobileSidebarSheetProvider({ children }: PropsWithChildren) {
  const [isOpen, setOpen] = useState(false)
  return (
    <MobileSidebarSheetContext.Provider value={{ isOpen, setOpen }}>
      {children}
    </MobileSidebarSheetContext.Provider>
  )
}

export function useMobileSidebarSheet(): MobileSidebarSheetContextValue {
  const ctx = useContext(MobileSidebarSheetContext)
  if (!ctx) {
    throw new Error('useMobileSidebarSheet must be used within MobileSidebarSheetProvider')
  }
  return ctx
}
