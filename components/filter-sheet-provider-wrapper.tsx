'use client'

import { useState, ReactNode } from 'react'
import { FilterSheetProvider } from './mobile-toolbar'
import { MobileFilterSheet } from './mobile-filter-sheet'

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
      <MobileFilterSheet open={open} onOpenChange={setOpen}>
        {filterContent}
      </MobileFilterSheet>
    </FilterSheetProvider>
  )
}
