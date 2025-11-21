'use client'

import { useState, ReactNode } from 'react'
import { FilterSheetProvider } from '@/components/layout/mobile-toolbar'
import { FilterSheet } from '@/components/filters/filter-sheet'

interface FilterSheetProviderWrapperProps {
  children: ReactNode
  filterContent: ReactNode
}

export const FilterSheetProviderWrapper = ({
  children,
  filterContent,
}: FilterSheetProviderWrapperProps) => {
  const [open, setOpen] = useState(false)

  return (
    <FilterSheetProvider onOpenFilters={() => setOpen(true)}>
      {children}
      <FilterSheet open={open} onOpenChange={setOpen}>
        {filterContent}
      </FilterSheet>
    </FilterSheetProvider>
  )
}
