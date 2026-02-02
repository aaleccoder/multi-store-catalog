import Color from 'color'
import { StoreTheme, ThemeKeys, ThemeModeOverrides } from '@/lib/theme'
import { StoreFontId } from '@/lib/store-fonts'
import { fontIdSet, themeKeySet } from './theme-constants'

export const parseThemeFromJson = (value: string): StoreTheme => {
    const trimmed = value.trim()
    if (!trimmed) {
        throw new Error('EMPTY_JSON')
    }

    let parsed: unknown
    try {
        parsed = JSON.parse(trimmed)
    } catch {
        throw new Error('INVALID_JSON')
    }

    if (!parsed || typeof parsed !== 'object') {
        throw new Error('INVALID_JSON')
    }

    const normalizeMode = (mode: unknown): ThemeModeOverrides => {
        if (!mode || typeof mode !== 'object') return {}

        return Object.entries(mode as Record<string, unknown>).reduce<ThemeModeOverrides>((acc, [key, val]) => {
            if (themeKeySet.has(key as ThemeKeys) && typeof val === 'string') {
                acc[key as ThemeKeys] = val
            }
            return acc
        }, {})
    }

    const normalizeBranding = (branding: unknown): StoreTheme['branding'] => {
        if (!branding || typeof branding !== 'object') return {}

        const source = branding as Record<string, unknown>
        const toNumber = (value: unknown) => {
            if (typeof value === 'number') return value
            if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value)
            return undefined
        }

        return {
            logoUrl: typeof source.logoUrl === 'string' ? source.logoUrl : undefined,
            logoAlt: typeof source.logoAlt === 'string' ? source.logoAlt : undefined,
            logoWidth: toNumber(source.logoWidth),
            logoHeight: toNumber(source.logoHeight),
        }
    }

    const normalizeFontId = (fontId: unknown): StoreTheme['fontId'] => {
        if (typeof fontId !== 'string') return undefined
        return fontIdSet.has(fontId as StoreFontId) ? (fontId as StoreFontId) : undefined
    }

    const hasLightOrDark = 'light' in (parsed as object) || 'dark' in (parsed as object)

    return {
        light: hasLightOrDark ? normalizeMode((parsed as { light?: unknown }).light) : normalizeMode(parsed),
        dark: normalizeMode((parsed as { dark?: unknown }).dark),
        branding: normalizeBranding((parsed as { branding?: unknown }).branding),
        fontId: normalizeFontId((parsed as { fontId?: unknown }).fontId),
    }
}

export const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        resolve(base64)
    }
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
})

export const getColorDescription = (key: ThemeKeys): string | undefined => {
    const descriptionMap: Partial<Record<ThemeKeys, string>> = {
        // Colores basicos
        background: 'Color de fondo principal de toda la tienda. Debe contrastar bien con los textos.',
        foreground: 'Color del texto principal. Debe tener alto contraste con el fondo.',
        card: 'Fondo de las tarjetas y componentes. Generalmente un poco mas claro/oscuro que el fondo principal.',
        cardForeground: 'Color del texto dentro de las tarjetas.',
        popover: 'Fondo de los menus emergentes y tooltips.',
        popoverForeground: 'Color del texto en los menus emergentes.',

        // Colores primarios y secundarios
        primary: 'Color primario para botones, enlaces y acciones principales. Define la identidad de marca.',
        primaryForeground: 'Color del texto sobre elementos primarios. Debe contrastar con primary.',
        secondary: 'Color secundario para elementos menos prominentes.',
        secondaryForeground: 'Color del texto sobre elementos secundarios.',

        // Estados y enfasis
        muted: 'Color para elementos deshabilitados o menos enfatizados.',
        mutedForeground: 'Color del texto en elementos mutados.',
        accent: 'Color de acento para destacar elementos. Generalmente diferente de primary.',
        accentForeground: 'Color del texto sobre elementos de acento.',
        destructive: 'Color para acciones destructivas (borrar, eliminar). Tipicamente rojo.',
        destructiveForeground: 'Color del texto sobre acciones destructivas.',

        // Elementos de interfaz
        border: 'Color de bordes y separadores de componentes.',
        input: 'Color de fondo de campos de entrada de texto.',
        ring: 'Color del anillo de enfoque para accesibilidad y navegacion con teclado.',

        // Graficos
        chart1: 'Color 1 para graficos y datos. Use colores distintivos para cada serie.',
        chart2: 'Color 2 para graficos y datos.',
        chart3: 'Color 3 para graficos y datos.',
        chart4: 'Color 4 para graficos y datos.',
        chart5: 'Color 5 para graficos y datos.',

        // Barra lateral
        sidebar: 'Color de fondo de la barra lateral. Generalmente contrasta con el fondo principal.',
        sidebarForeground: 'Color del texto en la barra lateral.',
        sidebarPrimary: 'Color primario usado en la barra lateral (enlaces activos).',
        sidebarPrimaryForeground: 'Color del texto sobre elementos primarios en la barra lateral.',
        sidebarAccent: 'Color de acento en la barra lateral (items seleccionados).',
        sidebarAccentForeground: 'Color del texto sobre acentos en la barra lateral.',
        sidebarBorder: 'Color de bordes y separadores en la barra lateral.',
        sidebarRing: 'Color del anillo de enfoque en elementos de la barra lateral.',

        // Sombras
        shadowColor: 'Color base para las sombras. Generalmente negro o gris oscuro. Se aplica a todas las sombras (2xs, xs, sm, etc).',
        shadowOpacity: 'Transparencia de las sombras (0-1). 0 = invisible, 1 = opaco. Tipicamente 0.1 a 0.25.',
        shadowBlur: 'Desenfoque de la sombra en pixeles. Mayor valor = sombra mas suave. Rango tipico: 4-40px.',
        shadowSpread: 'Extension de la sombra en pixeles. Valores positivos expanden la sombra, negativos la contraen.',
        shadowOffsetX: 'Desplazamiento horizontal de la sombra en pixeles. Negativo = izquierda, positivo = derecha.',
        shadowOffsetY: 'Desplazamiento vertical de la sombra en pixeles. Negativo = arriba, positivo = abajo.',

        // Sombras predefinidas - Sintaxis: offsetX offsetY blur spread color
        shadow2xs: 'Sombra muy sutil. Sintaxis: "0px 1px 2px -1px color, 0px 1px 2px -1px color". Dos capas para profundidad.',
        shadowXs: 'Sombra extra pequena. Sintaxis: "0px 1px 2px -1px color, 0px 1px 3px -1px color". Elevacion leve.',
        shadowSm: 'Sombra pequena. Sintaxis: "0px 1px 2px -1px color, 0px 2px 4px -2px color". Para componentes ligeros.',
        shadow: 'Sombra estandar. Sintaxis: "0px 1px 3px -1px color, 0px 1px 2px -1px color". Elevacion normal.',
        shadowMd: 'Sombra mediana. Sintaxis: "0px 4px 6px -1px color, 0px 2px 4px -2px color". Componentes prominentes.',
        shadowLg: 'Sombra grande. Sintaxis: "0px 10px 15px -3px color, 0px 4px 6px -2px color". Dropdowns y popups.',
        shadowXl: 'Sombra extra grande. Sintaxis: "0px 20px 25px -5px color, 0px 10px 10px -5px color". Elementos destacados.',
        shadow2xl: 'Sombra muy grande. Sintaxis: "0px 25px 50px -12px color". Para modales importantes.',

        // Tipografia y espaciado
        fontSans: 'Fuente sans-serif principal para textos y cuerpo.',
        fontSerif: 'Fuente serif para titulos elegantes (opcional).',
        fontMono: 'Fuente monoespaciada para codigo y texto tecnico.',
        letterSpacing: 'Espaciado entre letras en pixeles o em. Valores negativos aprietan el texto, positivos lo expanden.',
        spacing: 'Unidad de espaciado base. El resto de espacios (padding, margin) se calculan multiplicando este valor.',
        radius: 'Radio de bordes redondeados en pixeles. Define cuan redondeadas son las esquinas de componentes.',
        trackingNormal: 'Rastreo normal de letras. Espaciado estandar entre caracteres.',
    }
    return descriptionMap[key]
}

export const labelForKey = (key: ThemeKeys) => {
    const labelMap: Partial<Record<ThemeKeys, string>> = {
        background: 'Fondo',
        foreground: 'Texto principal',
        card: 'Tarjeta',
        cardForeground: 'Texto de tarjeta',
        popover: 'Popover',
        popoverForeground: 'Texto popover',
        primary: 'Primario',
        primaryForeground: 'Texto primario',
        secondary: 'Secundario',
        secondaryForeground: 'Texto secundario',
        muted: 'Muted',
        mutedForeground: 'Texto muted',
        accent: 'Acento',
        accentForeground: 'Texto acento',
        destructive: 'Destructivo',
        destructiveForeground: 'Texto destructivo',
        border: 'Borde',
        input: 'Input',
        ring: 'Anillo de enfoque',
        chart1: 'Grafico color 1',
        chart2: 'Grafico color 2',
        chart3: 'Grafico color 3',
        chart4: 'Grafico color 4',
        chart5: 'Grafico color 5',
        sidebar: 'Sidebar fondo',
        sidebarForeground: 'Sidebar texto',
        sidebarPrimary: 'Sidebar primario',
        sidebarPrimaryForeground: 'Sidebar texto primario',
        sidebarAccent: 'Sidebar acento',
        sidebarAccentForeground: 'Sidebar texto acento',
        sidebarBorder: 'Sidebar borde',
        sidebarRing: 'Sidebar anillo',
        fontSans: 'Fuente sans',
        fontSerif: 'Fuente serif',
        fontMono: 'Fuente monoespaciada',
        radius: 'Radio de bordes',
        shadowColor: 'Color sombra',
        shadowOpacity: 'Opacidad sombra',
        shadowBlur: 'Desenfoque sombra',
        shadowSpread: 'Extension sombra',
        shadowOffsetX: 'Sombra desplazamiento X',
        shadowOffsetY: 'Sombra desplazamiento Y',
        letterSpacing: 'Espaciado de letras',
        spacing: 'Espaciado base',
        shadow2xs: 'Sombra 2xs',
        shadowXs: 'Sombra xs',
        shadowSm: 'Sombra sm',
        shadow: 'Sombra normal',
        shadowMd: 'Sombra md',
        shadowLg: 'Sombra lg',
        shadowXl: 'Sombra xl',
        shadow2xl: 'Sombra 2xl',
        trackingNormal: 'Tracking normal',
    }
    return labelMap[key] ?? key
}

export const toSafeColor = (value: string) => {
    try {
        return Color(value).hex()
    } catch {
        return '#000000'
    }
}

export const normalizeColor = (value: string) => {
    try {
        const color = Color(value)
        return { hex: color.hex(), alpha: color.alpha() }
    } catch {
        return { hex: '#000000', alpha: 1 }
    }
}
