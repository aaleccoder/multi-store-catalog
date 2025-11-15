'use client'

import { useState } from 'react'

interface FilterSidebarWrapperProps {
  children: React.ReactNode
  onOpenFilters: () => void
}

export const FilterSidebarWrapper = ({ children, onOpenFilters }: FilterSidebarWrapperProps) => {
  // Just pass through children - the provider is now at a higher level
  return <>{children}</>
}
