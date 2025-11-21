'use client'

import { ReactNode } from 'react'
import { FilterSheetProviderWrapper } from './filters/filter-sheet-provider-wrapper'

interface PageLayoutWrapperProps {
  children: ReactNode
  filterContent: ReactNode
}

export const PageLayoutWrapper = ({ children, filterContent }: PageLayoutWrapperProps) => {
  return (
    <FilterSheetProviderWrapper filterContent={filterContent}>
      {children}
    </FilterSheetProviderWrapper>
  )
}
