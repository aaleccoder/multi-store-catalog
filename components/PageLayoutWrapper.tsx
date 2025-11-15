'use client'

import { ReactNode } from 'react'
import { FilterSheetProviderWrapper } from './FilterSheetProviderWrapper'

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
