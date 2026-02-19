import { useParams } from 'common'
import { AdvisorButton } from 'components/layouts/AppLayout/AdvisorButton'
import { AssistantButton } from 'components/layouts/AppLayout/AssistantButton'
import { InlineEditorButton } from 'components/layouts/AppLayout/InlineEditorButton'
import { AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { Button, cn } from 'ui'

import { HelpDropdown } from '../LayoutHeader/HelpDropdown/HelpDropdown'
import { useMobileSidebarSheet } from '../LayoutSidebar/MobileSidebarSheetContext'

const DRAG_THRESHOLD_PX = 8
const TOP_WHEN_SHEET_OPEN = 40
const GAP_FROM_BOTTOM = 100

const FloatingBottomNavbar = ({ hideMobileMenu }: { hideMobileMenu?: boolean }) => {
  const { isOpen: isSheetOpen, setOpen: setIsSheetOpen } = useMobileSidebarSheet()
  const { ref: projectRef } = useParams()

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
      const el = e.currentTarget
      if (el.setPointerCapture) el.setPointerCapture(pointerId)

      const onWindowPointerMove = (moveEvent: PointerEvent) => {
        if (dragStartRef.current?.pointerId !== moveEvent.pointerId) return
        applyMove(moveEvent.clientX, moveEvent.clientY)
      }
      const onWindowPointerUpOrCancel = (upEvent: PointerEvent) => {
        if (dragStartRef.current?.pointerId !== upEvent.pointerId) return
        const target = upEvent.target as HTMLElement
        if (target?.releasePointerCapture) target.releasePointerCapture(upEvent.pointerId)
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

  const { width: navW, height: navH } = navSize
  const vw = typeof window !== 'undefined' ? window.innerWidth : 0
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0
  const centerX = vw > 0 && navW > 0 ? vw / 2 - navW / 2 : 0
  const defaultYClosed = vh > 0 ? vh - GAP_FROM_BOTTOM - (navH > 0 ? navH : 56) : 0

  const style: React.CSSProperties = (() => {
    const dragging = dragStartRef.current !== null
    const transition = dragging
      ? 'transform 0ms, z-index 0s'
      : 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), z-index 0s'
    const base = {
      zIndex: isSheetOpen ? 101 : 41,
      transition,
      touchAction: 'none',
    }

    if (position === null) {
      return {
        ...base,
        left: '50%',
        top: 0,
        transform: isSheetOpen
          ? `translate(-50%, ${TOP_WHEN_SHEET_OPEN}px)`
          : `translate(-50%, ${defaultYClosed}px)`,
      }
    }
    if (isSheetOpen) {
      return {
        ...base,
        left: 0,
        top: 0,
        transform: `translate(${centerX}px, ${TOP_WHEN_SHEET_OPEN}px)`,
      }
    }
    return {
      ...base,
      left: 0,
      top: 0,
      transform: `translate(${position.x}px, ${position.y}px)`,
    }
  })()

  return (
    <nav
      ref={navRef}
      aria-label="Floating navigation"
      className={cn(
        'flex pointer-events-auto cursor-grab active:cursor-grabbing flex-row items-center justify-between w-auto rounded-full bg-overlay/90 backdrop-blur-md pl-2 pr-4 py-2 gap-2 border shadow-[0px_3px_6px_-2px_rgba(0,0,0,0.07),0px_10px_30px_0px_rgba(0,0,0,0.10)]',
        'fixed md:hidden'
      )}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
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
            className={cn(
              'flex lg:hidden rounded-md min-w-[30px] w-[30px] h-[30px] data-[state=open]:bg-overlay-hover/30',
              !isSheetOpen && '!bg-surface-300'
            )}
            icon={isSheetOpen ? <X /> : <Menu />}
            onClick={() => setIsSheetOpen(true)}
          />
        )}
      </AnimatePresence>
    </nav>
  )
}

export default FloatingBottomNavbar
