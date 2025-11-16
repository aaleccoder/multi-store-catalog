'use client'

import { useLoading } from './loading-context'

export const NavigationLoadingBar = () => {
  const { isLoading } = useLoading()

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-transparent pointer-events-none"
      style={{ zIndex: 9999 }}
    >
      {isLoading && <div className="h-full bg-red-400 animate-loading-bar origin-left shadow-lg" />}
    </div>
  )
}
