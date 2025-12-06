import { defaultStoreFontId, resolveStoreFontFamily, StoreFontId } from './store-fonts'

export const defaultLightTheme = {
    background: 'oklch(98% 0 0)',
    foreground: 'oklch(18% 0 0)',
    card: 'oklch(99% 0 0)',
    cardForeground: 'oklch(18% 0 0)',
    popover: 'oklch(100% 0 0)',
    popoverForeground: 'oklch(18% 0 0)',
    primary: 'oklch(22% 0.02 0)',
    primaryForeground: 'oklch(98% 0 0)',
    secondary: 'oklch(92% 0.005 0)',
    secondaryForeground: 'oklch(22% 0.01 0)',
    muted: 'oklch(94% 0 0)',
    mutedForeground: 'oklch(40% 0 0)',
    accent: 'oklch(88% 0 0)',
    accentForeground: 'oklch(22% 0.01 0)',
    destructive: 'oklch(30% 0.01 0)',
    destructiveForeground: 'oklch(96% 0 0)',
    border: 'oklch(90% 0 0)',
    input: 'oklch(97% 0 0)',
    ring: 'oklch(28% 0.01 0)',
    chart1: 'oklch(20% 0 0)',
    chart2: 'oklch(35% 0 0)',
    chart3: 'oklch(50% 0 0)',
    chart4: 'oklch(70% 0 0)',
    chart5: 'oklch(85% 0 0)',
    sidebar: 'oklch(96% 0 0)',
    sidebarForeground: 'oklch(20% 0 0)',
    sidebarPrimary: 'oklch(22% 0.02 0)',
    sidebarPrimaryForeground: 'oklch(98% 0 0)',
    sidebarAccent: 'oklch(92% 0 0)',
    sidebarAccentForeground: 'oklch(20% 0 0)',
    sidebarBorder: 'oklch(90% 0 0)',
    sidebarRing: 'oklch(28% 0.01 0)',
    fontSans: 'Montserrat, sans-serif',
    fontSerif: 'Merriweather, serif',
    fontMono: 'JetBrains Mono, monospace',
    radius: '0.25rem',
    shadowColor: 'hsl(0 0% 0%)',
    shadowOpacity: '0.06',
    shadowBlur: '10px',
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
    background: 'oklch(12% 0 0)',
    foreground: 'oklch(92% 0 0)',
    card: 'oklch(16% 0 0)',
    cardForeground: 'oklch(92% 0 0)',
    popover: 'oklch(16% 0 0)',
    popoverForeground: 'oklch(92% 0 0)',
    primary: 'oklch(88% 0 0)',
    primaryForeground: 'oklch(10% 0 0)',
    secondary: 'oklch(24% 0 0)',
    secondaryForeground: 'oklch(92% 0 0)',
    muted: 'oklch(20% 0 0)',
    mutedForeground: 'oklch(70% 0 0)',
    accent: 'oklch(26% 0 0)',
    accentForeground: 'oklch(92% 0 0)',
    destructive: 'oklch(32% 0 0)',
    destructiveForeground: 'oklch(95% 0 0)',
    border: 'oklch(26% 0 0)',
    input: 'oklch(20% 0 0)',
    ring: 'oklch(88% 0 0)',
    chart1: 'oklch(88% 0 0)',
    chart2: 'oklch(70% 0 0)',
    chart3: 'oklch(52% 0 0)',
    chart4: 'oklch(36% 0 0)',
    chart5: 'oklch(24% 0 0)',
    sidebar: 'oklch(16% 0 0)',
    sidebarForeground: 'oklch(92% 0 0)',
    sidebarPrimary: 'oklch(88% 0 0)',
    sidebarPrimaryForeground: 'oklch(10% 0 0)',
    sidebarAccent: 'oklch(24% 0 0)',
    sidebarAccentForeground: 'oklch(92% 0 0)',
    sidebarBorder: 'oklch(26% 0 0)',
    sidebarRing: 'oklch(88% 0 0)',
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
