'use client'

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface MobileFilterSheetProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const MobileFilterSheet = ({ children, open, onOpenChange }: MobileFilterSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Filtros
          </SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto h-[calc(100vh-73px)]">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
