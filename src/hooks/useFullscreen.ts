import { useCallback, useEffect, useState } from 'react'
import type { RefObject } from 'react'

type FsDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => void
}
type FsElement = HTMLElement & { webkitRequestFullscreen?: () => void }
type FsVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void }

/**
 * Fullscreen for a container, with an iPhone fallback.
 *
 * iOS Safari refuses `requestFullscreen()` on ordinary elements — only the
 * <video> element itself can go fullscreen, via `webkitEnterFullscreen()`.
 * Passing the video ref lets us fall back to that so the button works there
 * too, instead of silently doing nothing.
 */
export function useFullscreen(
  targetRef: RefObject<HTMLElement | null>,
  videoRef?: RefObject<HTMLVideoElement | null>,
) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const doc = document as FsDocument
    const onChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement ?? doc.webkitFullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  const toggle = useCallback(() => {
    const doc = document as FsDocument
    const active = document.fullscreenElement ?? doc.webkitFullscreenElement

    if (active) {
      if (document.exitFullscreen) void document.exitFullscreen().catch(() => {})
      else doc.webkitExitFullscreen?.()
      return
    }

    const el = targetRef.current as FsElement | null
    if (el?.requestFullscreen) {
      void el.requestFullscreen().catch(() => {})
    } else if (el?.webkitRequestFullscreen) {
      el.webkitRequestFullscreen()
    } else {
      // iPhone: only the video element can do this. Fall back to the video
      // inside the target when no explicit ref was handed over.
      const v = (videoRef?.current ??
        targetRef.current?.querySelector('video')) as FsVideo | null
      v?.webkitEnterFullscreen?.()
    }
  }, [targetRef, videoRef])

  return { isFullscreen, toggle }
}
