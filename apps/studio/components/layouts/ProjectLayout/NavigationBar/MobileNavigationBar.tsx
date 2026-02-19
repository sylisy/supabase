import { useParams } from 'common'
import { ConnectButton } from 'components/interfaces/ConnectButton/ConnectButton'
import { SidebarContent } from 'components/interfaces/Sidebar'
import { UserDropdown } from 'components/interfaces/UserDropdown'
import { AdvisorButton } from 'components/layouts/AppLayout/AdvisorButton'
import { AssistantButton } from 'components/layouts/AppLayout/AssistantButton'
import { InlineEditorButton } from 'components/layouts/AppLayout/InlineEditorButton'
import { AnimatePresence } from 'framer-motion'
import { IS_PLATFORM } from 'lib/constants'
import { Menu, Search, X } from 'lucide-react'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { sidebarManagerState, useSidebarManagerSnapshot } from 'state/sidebar-manager-state'
import { Button, cn } from 'ui'
import { CommandMenuTrigger } from 'ui-patterns'
import MobileSheetNav from 'ui-patterns/MobileSheetNav/MobileSheetNav'

import { HelpDropdown } from '../LayoutHeader/HelpDropdown/HelpDropdown'
import { HomeIcon } from '../LayoutHeader/HomeIcon'
import { useMobileSidebarSheet } from '../LayoutSidebar/MobileSidebarSheetContext'
import { OrgSelector } from './OrgSelector'
import { ProjectBranchSelector } from './ProjectBranchSelector'

export const ICON_SIZE = 20
export const ICON_STROKE_WIDTH = 1.5

const MobileNavigationBar = ({ hideMobileMenu }: { hideMobileMenu?: boolean }) => {
  const { isOpen: isSheetOpen, setOpen: setIsSheetOpen } = useMobileSidebarSheet()
  const { activeSidebar } = useSidebarManagerSnapshot()
  const { ref: projectRef } = useParams()
  const isProjectScope = !!projectRef

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const dragStartRef = useRef<{
    x: number
    y: number
    startX: number
    startY: number
    pointerId: number
  } | null>(null)
  const navRef = useRef<HTMLElement | null>(null)
  const [navSize, setNavSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const el = navRef.current
    if (!el) return
    const measure = () => {
      const rect = el.getBoundingClientRect()
      setNavSize((prev) =>
        prev.width !== rect.width || prev.height !== rect.height
          ? { width: rect.width, height: rect.height }
          : prev
      )
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (!isSheetOpen) return
    const raf = requestAnimationFrame(() => {
      const el = navRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setNavSize((prev) =>
        prev.width !== rect.width || prev.height !== rect.height
          ? { width: rect.width, height: rect.height }
          : prev
      )
    })
    return () => cancelAnimationFrame(raf)
  }, [isSheetOpen])

  const endDrag = useCallback(() => {
    dragStartRef.current = null
  }, [])

  const DRAG_THRESHOLD_PX = 8

  const applyMove = useCallback((clientX: number, clientY: number) => {
    const state = dragStartRef.current
    if (!state) return
    const { x, y, startX, startY } = state
    const dist = Math.hypot(clientX - startX, clientY - startY)
    if (dist < DRAG_THRESHOLD_PX) return
    const dx = clientX - startX
    const dy = clientY - startY
    const rect = navRef.current?.getBoundingClientRect()
    const w = rect?.width ?? 200
    const h = rect?.height ?? 48
    const maxX = typeof window !== 'undefined' ? window.innerWidth - w : 0
    const maxY = typeof window !== 'undefined' ? window.innerHeight - h : 0
    const nextX = Math.max(0, Math.min(maxX, x + dx))
    const nextY = Math.max(0, Math.min(maxY, y + dy))
    setPosition({ x: nextX, y: nextY })
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const rect = navRef.current?.getBoundingClientRect()
      if (!rect) return
      const currentX = position?.x ?? rect.left
      const currentY = position?.y ?? rect.top
      const pointerId = e.pointerId
      dragStartRef.current = {
        x: currentX,
        y: currentY,
        startX: e.clientX,
        startY: e.clientY,
        pointerId,
      }

      const onWindowPointerMove = (moveEvent: PointerEvent) => {
        if (dragStartRef.current?.pointerId !== moveEvent.pointerId) return
        applyMove(moveEvent.clientX, moveEvent.clientY)
      }
      const onWindowPointerUpOrCancel = (upEvent: PointerEvent) => {
        if (dragStartRef.current?.pointerId !== upEvent.pointerId) return
        window.removeEventListener('pointermove', onWindowPointerMove)
        window.removeEventListener('pointerup', onWindowPointerUpOrCancel)
        window.removeEventListener('pointercancel', onWindowPointerUpOrCancel)
        dragStartRef.current = null
      }
      window.addEventListener('pointermove', onWindowPointerMove)
      window.addEventListener('pointerup', onWindowPointerUpOrCancel)
      window.addEventListener('pointercancel', onWindowPointerUpOrCancel)
    },
    [position, applyMove]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      applyMove(e.clientX, e.clientY)
    },
    [applyMove]
  )

  const handlePointerUp = useCallback(() => {
    endDrag()
  }, [endDrag])

  const topWhenSheetOpen = 40
  const gapFromBottom = 100
  const { width: navW, height: navH } = navSize
  const vw = typeof window !== 'undefined' ? window.innerWidth : 0
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0
  const centerX = vw > 0 && navW > 0 ? vw / 2 - navW / 2 : 0
  const defaultYClosed = vh > 0 && navH > 0 ? vh - gapFromBottom - navH : vh - gapFromBottom

  const style: React.CSSProperties = (() => {
    const base = {
      left: 0,
      top: 0,
      zIndex: isSheetOpen ? 101 : 41,
      transition: 'transform 300ms ease-out, z-index 0s',
    }
    if (isSheetOpen) {
      return {
        ...base,
        transform: `translate(${centerX}px, ${topWhenSheetOpen}px)`,
      }
    }
    if (position !== null) {
      return {
        ...base,
        transform: `translate(${position.x}px, ${position.y}px)`,
      }
    }
    return {
      ...base,
      transform: `translate(${centerX}px, ${defaultYClosed}px)`,
    }
  })()

  const FloatingBottomNavbar = () => (
    <nav
      ref={navRef}
      aria-label="Floating navigation"
      className={cn(
        'flex pointer-events-auto cursor-grab active:cursor-grabbing flex-row items-center justify-between w-auto rounded-full bg-overlay/90 backdrop-blur-md pl-2 pr-4 py-2 gap-2 border shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10),0px_10px_20px_0px_rgba(0,0,0,0.20)]',
        'transition-transform duration-300',
        'fixed md:hidden'
      )}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <AnimatePresence initial={false}>
        {!!projectRef && (
          <>
            <AssistantButton />
            <InlineEditorButton />
          </>
        )}
        <AdvisorButton projectRef={projectRef} />
        <HelpDropdown />
        {!hideMobileMenu && (
          <Button
            title="Menu dropdown button"
            type={isSheetOpen ? 'secondary' : 'default'}
            className="flex lg:hidden rounded-md min-w-[30px] w-[30px] h-[30px] data-[state=open]:bg-overlay-hover/30"
            icon={isSheetOpen ? <X /> : <Menu />}
            onClick={() => setIsSheetOpen(true)}
          />
        )}
      </AnimatePresence>
    </nav>
  )

  return (
    <div className="w-full flex flex-row md:hidden">
      <nav
        className={cn(
          'group pr-3 pl-2 z-10 w-full h-12 gap-2',
          'border-b bg-dash-sidebar border-default shadow-xl',
          'transition-width duration-200',
          'hide-scrollbar flex flex-row items-center justify-between overflow-x-auto'
        )}
      >
        <div className={cn('flex min-w-0 flex-shrink items-center gap-2', !IS_PLATFORM && 'pl-2')}>
          {!IS_PLATFORM && <HomeIcon />}
          {isProjectScope ? (
            <>
              <ProjectBranchSelector />
              <ConnectButton className="[&_span]:hidden h-8 w-8" />
            </>
          ) : IS_PLATFORM ? (
            <OrgSelector />
          ) : null}
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <CommandMenuTrigger>
            <button
              type="button"
              className={cn(
                'group',
                'flex-grow h-[30px] rounded-md',
                'p-2',
                'flex items-center justify-between',
                'bg-transparent border-none text-foreground-lighter',
                'hover:bg-opacity-100 hover:border-strong hover:text-foreground-light',
                'focus-visible:!outline-4 focus-visible:outline-offset-1 focus-visible:outline-brand-600',
                'transition'
              )}
            >
              <div className="flex items-center space-x-2">
                <Search size={18} strokeWidth={2} />
              </div>
            </button>
          </CommandMenuTrigger>
          <UserDropdown />
        </div>
      </nav>
      <MobileSheetNav
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open)
          if (!open) sidebarManagerState.closeActive()
        }}
        data-state="expanded"
      >
        {activeSidebar?.component?.() ?? <SidebarContent />}
      </MobileSheetNav>
      <FloatingBottomNavbar />
    </div>
  )
}

export default MobileNavigationBar
