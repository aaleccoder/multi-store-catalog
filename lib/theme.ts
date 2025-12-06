import { defaultStoreFontId, resolveStoreFontFamily, StoreFontId } from './store-fonts'

export const defaultLightTheme = {
    background: 'oklch(99% 0.001 0)',
    foreground: 'oklch(20% 0.02 0)',
    card: 'oklch(100% 0 0)',
    cardForeground: 'oklch(20% 0.02 0)',
    popover: 'oklch(100% 0 0)',
    popoverForeground: 'oklch(20% 0.02 0)',
    primary: '#F4B639',
    primaryForeground: '#4A3428',
    secondary: '#924E43',
    secondaryForeground: 'oklch(98% 0.01 0)',
    muted: 'oklch(95% 0.015 50)',
    mutedForeground: 'oklch(45% 0.04 50)',
    accent: '#4A3428',
    accentForeground: '#F4B639',
    destructive: '#924E43',
    destructiveForeground: 'oklch(100% 0 0)',
    border: 'oklch(88% 0.02 50)',
    input: 'oklch(98% 0.01 50)',
    ring: '#F4B639',
    chart1: '#F4B639',
    chart2: '#924E43',
    chart3: '#4A3428',
    chart4: '#D48A47',
    chart5: '#6B4E3D',
    sidebar: 'oklch(97% 0.015 50)',
    sidebarForeground: '#4A3428',
    sidebarPrimary: '#F4B639',
    sidebarPrimaryForeground: '#4A3428',
    sidebarAccent: '#FDF5E6',
    sidebarAccentForeground: '#4A3428',
    sidebarBorder: 'oklch(88% 0.02 50)',
    sidebarRing: '#F4B639',
    fontSans: 'Montserrat, sans-serif',
    fontSerif: 'Merriweather, serif',
    fontMono: 'JetBrains Mono, monospace',
    radius: '0.25rem',
    shadowColor: 'hsl(0 0% 0%)',
    shadowOpacity: '0.08',
    shadowBlur: '12px',
    shadowSpread: '0px',
    shadowOffsetX: '0px',
    shadowOffsetY: '2px',
    letterSpacing: '0em',
    spacing: '0.25rem',
    shadow2xs: '0px 4px 8px -1px hsl(0 0% 0% / 0.05)',
    shadowXs: '0px 4px 8px -1px hsl(0 0% 0% / 0.05)',
    shadowSm: '0px 4px 8px -1px hsl(0 0% 0% / 0.1), 0px 1px 2px -2px hsl(0 0% 0% / 0.1)',
    shadow: '0px 4px 8px -1px hsl(0 0% 0% / 0.1), 0px 1px 2px -2px hsl(0 0% 0% / 0.1)',
    shadowMd: '0px 4px 8px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1)',
    shadowLg: '0px 4px 8px -1px hsl(0 0% 0% / 0.1), 0px 4px 6px -2px hsl(0 0% 0% / 0.1)',
    shadowXl: '0px 4px 8px -1px hsl(0 0% 0% / 0.1), 0px 8px 10px -2px hsl(0 0% 0% / 0.1)',
    shadow2xl: '0px 4px 8px -1px hsl(0 0% 0% / 0.25)',
    trackingNormal: '0em',
}

export const defaultDarkTheme: typeof defaultLightTheme = {
    background: 'oklch(15% 0.01 0)',
    foreground: 'oklch(95% 0.01 0)',
    card: 'oklch(22% 0.01 0)',
    cardForeground: 'oklch(95% 0.01 0)',
    popover: 'oklch(22% 0.01 0)',
    popoverForeground: 'oklch(95% 0.01 0)',
    primary: 'oklch(52% 0.24 28)',
    primaryForeground: 'oklch(15% 0.01 0)',
    secondary: 'oklch(35% 0.04 80)',
    secondaryForeground: 'oklch(90% 0.01 0)',
    muted: 'oklch(28% 0.01 0)',
    mutedForeground: 'oklch(65% 0.03 0)',
    accent: 'oklch(60% 0.2 40)',
    accentForeground: 'oklch(15% 0.01 0)',
    destructive: 'oklch(52% 0.24 28)',
    destructiveForeground: 'oklch(15% 0.01 0)',
    border: 'oklch(32% 0.01 0)',
    input: 'oklch(25% 0.01 0)',
    ring: 'oklch(52% 0.24 28)',
    chart1: 'oklch(52% 0.24 28)',
    chart2: 'oklch(60% 0.2 40)',
    chart3: 'oklch(55% 0.18 260)',
    chart4: 'oklch(65% 0.15 190)',
    chart5: 'oklch(80% 0.15 130)',
    sidebar: 'oklch(22% 0.01 0)',
    sidebarForeground: 'oklch(95% 0.01 0)',
    sidebarPrimary: 'oklch(52% 0.24 28)',
    sidebarPrimaryForeground: 'oklch(15% 0.01 0)',
    sidebarAccent: 'oklch(35% 0.04 80)',
    sidebarAccentForeground: 'oklch(90% 0.01 0)',
    sidebarBorder: 'oklch(32% 0.01 0)',
    sidebarRing: 'oklch(52% 0.24 28)',
    fontSans: 'Inter, sans-serif',
    fontSerif: 'Merriweather, serif',
    fontMono: 'JetBrains Mono, monospace',
    radius: '0.5rem',
    shadowColor: 'hsl(0 0% 0%)',
    shadowOpacity: '0.1',
    shadowBlur: '8px',
    shadowSpread: '-1px',
    shadowOffsetX: '0px',
    shadowOffsetY: '4px',
    letterSpacing: '0em',
    spacing: '0.25rem',
    shadow2xs: '0px 4px 8px -1px hsl(0 0% 0% / 0.05)',
    shadowXs: '0px 4px 8px -1px hsl(0 0% 0% / 0.05)',
    shadowSm: '0px 4px 8px -1px hsl(0 0% 0% / 0.1), 0px 1px 2px -2px hsl(0 0% 0% / 0.1)',
    shadow: '0px 4px 8px -1px hsl(0 0% 0% / 0.1), 0px 1px 2px -2px hsl(0 0% 0% / 0.1)',
    shadowMd: '0px 4px 8px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1)',
    shadowLg: '0px 4px 8px -1px hsl(0 0% 0% / 0.1), 0px 4px 6px -2px hsl(0 0% 0% / 0.1)',
    shadowXl: '0px 4px 8px -1px hsl(0 0% 0% / 0.1), 0px 8px 10px -2px hsl(0 0% 0% / 0.1)',
    shadow2xl: '0px 4px 8px -1px hsl(0 0% 0% / 0.25)',
    trackingNormal: '0em',
}

export type ThemeKeys = keyof typeof defaultLightTheme
export type ThemeModeOverrides = Partial<Record<ThemeKeys, string>>

export interface StoreBranding {
    logoUrl?: string
    logoAlt?: string
    logoWidth?: number
    logoHeight?: number
}

export const defaultStoreBranding: StoreBranding = {
    logoUrl: '/android-chrome-192x192.png',
    logoAlt: 'Lea Logo',
    logoWidth: 100,
    logoHeight: 100,
}

export interface StoreTheme {
    light?: ThemeModeOverrides
    dark?: ThemeModeOverrides
    branding?: StoreBranding
    fontId?: StoreFontId
}

export const defaultStoreTheme: StoreTheme = {
    light: { ...defaultLightTheme },
    dark: { ...defaultDarkTheme },
    branding: defaultStoreBranding,
    fontId: defaultStoreFontId,
}

export function mergeTheme(theme?: StoreTheme | null) {
    const resolved = theme ?? defaultStoreTheme
    const branding = { ...defaultStoreBranding, ...(resolved.branding ?? {}) }
    const fontId = resolved.fontId ?? defaultStoreFontId
    const resolvedFontFamily = resolveStoreFontFamily(fontId)

    return {
        light: { ...defaultLightTheme, ...(resolved.light ?? {}), fontSans: resolvedFontFamily, fontSerif: resolvedFontFamily },
        dark: { ...defaultDarkTheme, ...(resolved.dark ?? {}), fontSans: resolvedFontFamily, fontSerif: resolvedFontFamily },
        branding,
        fontId,
    }
}

export function themeToCssVars(theme: ReturnType<typeof mergeTheme>) {
    const createBlock = (selector: string, values: Record<ThemeKeys, string>) => {
        const body = Object.entries(values)
            .map(([key, value]) => `  --${toKebab(key)}: ${value};`)
            .join('\n')
        return `${selector} {\n${body}\n}`
    }

    return [
        createBlock(':root', theme.light),
        createBlock('.dark', theme.dark),
    ].join('\n\n')
}

const toKebab = (value: string) => value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)
