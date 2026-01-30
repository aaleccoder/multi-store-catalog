import { Inter, Lora, Merriweather, Outfit, Playfair_Display } from 'next/font/google'

const outfit = Outfit({ subsets: ['latin'], display: 'swap', variable: '--store-font-sans' })
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--store-font-sans' })
const lora = Lora({ subsets: ['latin'], display: 'swap', variable: '--store-font-sans' })
const merriweather = Merriweather({ subsets: ['latin'], display: 'swap', variable: '--store-font-sans' })
const playfair = Playfair_Display({ subsets: ['latin'], display: 'swap', variable: '--store-font-sans' })

export const storeFontRegistry = {
    outfit: {
        label: 'Outfit',
        font: outfit,
        cssFamily: '"Outfit", sans-serif',
    },
    inter: {
        label: 'Inter',
        font: inter,
        cssFamily: '"Inter", sans-serif',
    },
    lora: {
        label: 'Lora',
        font: lora,
        cssFamily: '"Lora", serif',
    },
    merriweather: {
        label: 'Merriweather',
        font: merriweather,
        cssFamily: '"Merriweather", serif',
    },
    playfair: {
        label: 'Playfair Display',
        font: playfair,
        cssFamily: '"Playfair Display", serif',
    },
} satisfies Record<string, { label: string; font: { className: string; variable: string }; cssFamily: string }>

export type StoreFontId = keyof typeof storeFontRegistry

export const defaultStoreFontId: StoreFontId = 'outfit'

export const storeFontOptions = Object.entries(storeFontRegistry).map(([id, value]) => ({
    id: id as StoreFontId,
    label: value.label,
}))

export function resolveStoreFont(id?: StoreFontId) {
    return storeFontRegistry[id ?? defaultStoreFontId] ?? storeFontRegistry[defaultStoreFontId]
}

export function resolveStoreFontFamily(id?: StoreFontId) {
    return resolveStoreFont(id).cssFamily
}

export function resolveStoreFontClassName(id?: StoreFontId) {
    const resolved = resolveStoreFont(id)
    return `${resolved.font.className} ${resolved.font.variable}`.trim()
}
