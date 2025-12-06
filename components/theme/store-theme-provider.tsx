'use client'

import React from 'react'
import { mergeTheme, themeToCssVars, StoreTheme } from '@/lib/theme'

interface StoreThemeProviderProps {
    theme?: StoreTheme
    children: React.ReactNode
}

export function StoreThemeProvider({ theme, children }: StoreThemeProviderProps) {
    const merged = React.useMemo(() => mergeTheme(theme), [theme])
    const css = React.useMemo(() => themeToCssVars(merged), [merged])

    return (
        <>
            <style
                id="store-theme"
                dangerouslySetInnerHTML={{ __html: css }}
            />
            {children}
        </>
    )
}
