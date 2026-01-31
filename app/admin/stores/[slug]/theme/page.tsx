'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Color from 'color'
import { trpc } from '@/trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Palette } from 'lucide-react'
import { toast } from 'sonner'
import { defaultStoreBranding, defaultStoreTheme, defaultLightTheme, mergeTheme, StoreTheme, ThemeKeys, ThemeModeOverrides } from '@/lib/theme'
import { defaultStoreFontId, storeFontOptions, StoreFontId } from '@/lib/store-fonts'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const themeKeys = Object.keys(defaultLightTheme) as ThemeKeys[]
const editableThemeKeys = themeKeys.filter((key) => key !== 'fontSans' && key !== 'fontSerif')
const colorThemeKeys: ThemeKeys[] = [
    'background', 'foreground', 'card', 'cardForeground', 'popover', 'popoverForeground',
    'primary', 'primaryForeground', 'secondary', 'secondaryForeground', 'muted', 'mutedForeground',
    'accent', 'accentForeground', 'destructive', 'destructiveForeground', 'border', 'input', 'ring',
    'chart1', 'chart2', 'chart3', 'chart4', 'chart5', 'sidebar', 'sidebarForeground', 'sidebarPrimary',
    'sidebarPrimaryForeground', 'sidebarAccent', 'sidebarAccentForeground', 'sidebarBorder', 'sidebarRing',
]
const colorKeySet = new Set<ThemeKeys>(colorThemeKeys)
const themeKeySet = new Set<ThemeKeys>(themeKeys)
const fontIdSet = new Set<StoreFontId>(storeFontOptions.map((font) => font.id))
const shadowPresetKeys = new Set<ThemeKeys>([
    'shadow2xs',
    'shadowXs',
    'shadowSm',
    'shadow',
    'shadowMd',
    'shadowLg',
    'shadowXl',
    'shadow2xl',
])

export default function ThemePage() {
    const router = useRouter()
    const { data: stores, isLoading: storesLoading } = trpc.admin.stores.list.useQuery()
    const utils = trpc.useUtils()
    const uploadMedia = trpc.admin.media.upload.useMutation()
    const updateStore = trpc.admin.stores.update.useMutation({
        onSuccess: async () => {
            await utils.admin.stores.list.invalidate()
        },
    })

    const [selectedStoreId, setSelectedStoreId] = useState<string>('')
    const [importText, setImportText] = useState('')

    type StoreWithTheme = { id: string; name: string; theme?: unknown }

    const normalizedStores: StoreWithTheme[] = (stores as StoreWithTheme[] | undefined) ?? []

    const firstStoreId = normalizedStores[0]?.id ?? ''
    const activeStoreId = selectedStoreId || firstStoreId
    const activeStore = normalizedStores.find((store) => store.id === activeStoreId) ?? null

    const [themeDrafts, setThemeDrafts] = useState<Record<string, StoreTheme>>({})

    const baseTheme = useMemo<StoreTheme>(() => {
        if (!activeStore) return defaultStoreTheme
        const rawTheme = 'theme' in activeStore ? (activeStore.theme as Partial<StoreTheme> | undefined) : undefined

        return {
            light: { ...defaultStoreTheme.light, ...(rawTheme?.light ?? {}) },
            dark: { ...defaultStoreTheme.dark, ...(rawTheme?.dark ?? {}) },
            branding: { ...defaultStoreBranding, ...(rawTheme?.branding ?? {}) },
            fontId: rawTheme?.fontId ?? defaultStoreFontId,
        }
    }, [activeStore])

    const theme = useMemo<StoreTheme>(() => {
        if (!activeStoreId) return baseTheme
        return themeDrafts[activeStoreId] ?? baseTheme
    }, [activeStoreId, baseTheme, themeDrafts])

    const mergedTheme = useMemo(() => mergeTheme(theme), [theme])
    const branding = theme.branding ?? defaultStoreBranding
    const selectedFontId = theme.fontId ?? defaultStoreFontId

    const handleLogoFile = async (file: File) => {
        if (!activeStoreId) return
        try {
            const base64 = await fileToBase64(file)
            const uploaded = await uploadMedia.mutateAsync({
                fileBase64: base64,
                fileName: file.name,
                mimeType: file.type,
                alt: branding.logoAlt || file.name,
            })

            handleBrandingChange('logoUrl', uploaded.url)
            handleBrandingChange('logoAlt', uploaded.alt ?? branding.logoAlt)
            toast.success('Logo subido')
        } catch (error) {
            console.error(error)
            toast.error('No se pudo subir el logo')
        }
    }

    const handleChange = (mode: 'light' | 'dark', key: ThemeKeys, value: string) => {
        if (!activeStoreId) return

        setThemeDrafts((prev) => {
            const current = prev[activeStoreId] ?? baseTheme

            return {
                ...prev,
                [activeStoreId]: {
                    ...current,
                    [mode]: {
                        ...(current[mode] ?? defaultStoreTheme[mode]),
                        [key]: value,
                    },
                },
            }
        })
    }

    const handleBrandingChange = (key: keyof NonNullable<StoreTheme['branding']>, value: string | number | undefined) => {
        if (!activeStoreId) return

        setThemeDrafts((prev) => {
            const current = prev[activeStoreId] ?? baseTheme

            return {
                ...prev,
                [activeStoreId]: {
                    ...current,
                    branding: {
                        ...(current.branding ?? defaultStoreBranding),
                        [key]: value === '' ? undefined : value,
                    },
                },
            }
        })
    }

    const handleFontChange = (fontId: StoreFontId) => {
        if (!activeStoreId) return

        setThemeDrafts((prev) => {
            const current = prev[activeStoreId] ?? baseTheme

            return {
                ...prev,
                [activeStoreId]: {
                    ...current,
                    fontId,
                },
            }
        })
    }

    const handleSave = async () => {
        if (!activeStoreId) {
            toast.error('Selecciona una tienda')
            return
        }
        try {
            const currentTheme = themeDrafts[activeStoreId] ?? baseTheme
            await updateStore.mutateAsync({ id: activeStoreId, data: { theme: currentTheme } })
            router.refresh()
            toast.success('Tema actualizado')
        } catch {
            toast.error('No se pudo guardar el tema')
        }
    }

    const handleImport = () => {
        if (!activeStoreId) {
            toast.error('Selecciona una tienda')
            return
        }

        try {
            const parsed = parseThemeFromJson(importText)

            setThemeDrafts((prev) => ({
                ...prev,
                [activeStoreId]: {
                    light: { ...baseTheme.light, ...(parsed.light ?? {}) },
                    dark: { ...baseTheme.dark, ...(parsed.dark ?? {}) },
                    branding: { ...(baseTheme.branding ?? defaultStoreBranding), ...(parsed.branding ?? {}) },
                    fontId: parsed.fontId ?? baseTheme.fontId ?? defaultStoreFontId,
                },
            }))

            toast.success('Tema importado')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'UNKNOWN'

            if (message === 'EMPTY_JSON') {
                toast.error('Pega un JSON con las variables del tema')
                return
            }

            toast.error('JSON inválido')
        }
    }

    if (storesLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!stores || stores.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">Crea una tienda para personalizar su tema.</p>
                <Button asChild>
                    <a href="/admin/stores">Crear tienda</a>
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="md:pt-20 lg:pt-0">
                <div className="p-4 md:p-8 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2"><Palette className="h-6 w-6" /> Tema de la tienda</h1>
                            <p className="text-sm text-muted-foreground">Ajusta los colores y tipografías usados en la tienda.</p>
                        </div>
                        <div className="flex gap-3 items-center">
                            <Label className="text-sm">Tienda</Label>
                            <select
                                className="border border-input rounded-md px-3 py-2 bg-background"
                                value={activeStoreId}
                                onChange={(e) => setSelectedStoreId(e.target.value)}
                            >
                                {normalizedStores.map((store) => (
                                    <option key={store.id} value={store.id}>
                                        {store.name}
                                    </option>
                                ))}
                            </select>
                            <Button onClick={handleSave} disabled={updateStore.isPending}>
                                {updateStore.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar tema'}
                            </Button>
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Importar variables</CardTitle>
                            <CardDescription>Pega un JSON con las claves light/dark y sus colores.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Textarea
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                                spellCheck={false}
                                placeholder='{"light": {"primary": "#000"}, "dark": {"primary": "#fff"}}'
                                className="font-mono text-sm"
                            />
                            <div className="flex justify-end">
                                <Button variant="outline" onClick={handleImport} disabled={!importText.trim()}>
                                    Importar JSON
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sintaxis de sombras CSS (box-shadow)</CardTitle>
                            <CardDescription>Cómo funcionan los valores de sombra en CSS</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-muted/50 p-3 rounded-md font-mono text-sm space-y-2">
                                <p><span className="text-primary font-bold">Sintaxis:</span> offsetX offsetY blur spread color</p>
                                <p className="text-xs text-muted-foreground">El orden importa: primero se desplaza la sombra (X y Y), luego se difumina (blur), después se expande o contrae (spread) y por último se pinta el color.</p>
                                <p className="text-xs text-muted-foreground">Puedes encadenar varias sombras separadas por comas; cada conjunto sigue la misma distribución.</p>
                                <p className="text-xs text-muted-foreground">Esta secuencia controla dirección, profundidad, suavidad, tamaño y transparencia en una sola línea.</p>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="font-semibold text-sm mb-2">Ejemplo de tu sombra:</p>
                                    <div className="bg-muted/50 p-3 rounded-md font-mono text-xs space-y-1">
                                        <p><span className="text-blue-600">0px</span> <span className="text-green-600">4px</span> <span className="text-purple-600">8px</span> <span className="text-orange-600">-1px</span> <span className="text-red-600">hsl(0 0% 0% / 0.08)</span>,</p>
                                        <p><span className="text-blue-600">0px</span> <span className="text-green-600">4px</span> <span className="text-purple-600">6px</span> <span className="text-orange-600">-2px</span> <span className="text-red-600">hsl(0 0% 0% / 0.08)</span></p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="border-l-4 border-blue-500 pl-3">
                                        <p className="font-semibold text-blue-600">offsetX (0px)</p>
                                        <p className="text-xs text-muted-foreground">Desplazamiento horizontal. 0px = centrado. Positivo = derecha, negativo = izquierda.</p>
                                    </div>
                                    <div className="border-l-4 border-green-500 pl-3">
                                        <p className="font-semibold text-green-600">offsetY (4px)</p>
                                        <p className="text-xs text-muted-foreground">Desplazamiento vertical. Positivo = abajo, negativo = arriba. 4px = sombra debajo.</p>
                                    </div>
                                    <div className="border-l-4 border-purple-500 pl-3">
                                        <p className="font-semibold text-purple-600">blur (8px, 6px)</p>
                                        <p className="text-xs text-muted-foreground">Desenfoque en píxeles. Mayor valor = sombra más suave y difusa. 0px = bordes nítidos.</p>
                                    </div>
                                    <div className="border-l-4 border-orange-500 pl-3">
                                        <p className="font-semibold text-orange-600">spread (-1px, -2px)</p>
                                        <p className="text-xs text-muted-foreground">Expansión de la sombra. Valores negativos contraen (sombra adentro). Positivos expanden.</p>
                                    </div>
                                    <div className="border-l-4 border-red-500 pl-3 md:col-span-2">
                                        <p className="font-semibold text-red-600">color (hsl(0 0% 0% / 0.08))</p>
                                        <p className="text-xs text-muted-foreground">Color de la sombra en cualquier formato CSS. hsl(...) es más flexible. 0.08 = 8% opacidad.</p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-md">
                                    <p className="text-xs font-semibold mb-1">💡 Cómo funciona tu ejemplo:</p>
                                    <ul className="text-xs space-y-1 text-muted-foreground">
                                        <li>• <span className="font-mono">0px 4px 8px -1px</span>: Sombra suave abajo, ligeramente contraída</li>
                                        <li>• <span className="font-mono">0px 4px 6px -2px</span>: Segunda sombra más cercana al elemento (más contraída)</li>
                                        <li>• Juntas crean profundidad con dos capas de sombra</li>
                                        <li>• <span className="font-mono">0.08</span> opacidad = muy sutil, no domina el diseño</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Identidad de la tienda</CardTitle>
                                <CardDescription>Configura el logo que se mostrará en el storefront.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="logo-url">Logo (URL)</Label>
                                    <Input
                                        id="logo-url"
                                        value={branding.logoUrl ?? ''}
                                        onChange={(e) => handleBrandingChange('logoUrl', e.target.value)}
                                        placeholder="https://.../logo.png"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="logo-alt">Texto alternativo</Label>
                                    <Input
                                        id="logo-alt"
                                        value={branding.logoAlt ?? ''}
                                        onChange={(e) => handleBrandingChange('logoAlt', e.target.value)}
                                        placeholder="Nombre de la tienda"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="logo-width">Ancho (px)</Label>
                                        <Input
                                            id="logo-width"
                                            type="number"
                                            min={16}
                                            value={branding.logoWidth ?? ''}
                                            onChange={(e) => handleBrandingChange('logoWidth', e.target.value ? Number(e.target.value) : undefined)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="logo-height">Alto (px)</Label>
                                        <Input
                                            id="logo-height"
                                            type="number"
                                            min={16}
                                            value={branding.logoHeight ?? ''}
                                            onChange={(e) => handleBrandingChange('logoHeight', e.target.value ? Number(e.target.value) : undefined)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Vista previa</Label>
                                    <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-border bg-muted/30">
                                        {branding.logoUrl ? (
                                            <Image
                                                src={branding.logoUrl}
                                                alt={branding.logoAlt ?? 'Logo de la tienda'}
                                                width={branding.logoWidth ?? 100}
                                                height={branding.logoHeight ?? 100}
                                                className="object-contain max-h-28"
                                            />
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Añade la URL de tu logo.</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) handleLogoFile(file)
                                            }}
                                            disabled={uploadMedia.isPending}
                                        />
                                        {uploadMedia.isPending && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Subiendo...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Tipografía</CardTitle>
                                <CardDescription>Selecciona la fuente principal de la tienda.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="font-id">Fuente</Label>
                                    <select
                                        id="font-id"
                                        className="border border-input rounded-md px-3 py-2 bg-background w-full"
                                        value={selectedFontId}
                                        onChange={(e) => handleFontChange(e.target.value as StoreFontId)}
                                    >
                                        {storeFontOptions.map((font) => (
                                            <option key={font.id} value={font.id}>
                                                {font.label}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-muted-foreground">Se aplica a los textos principales y títulos.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {(['light', 'dark'] as const).map((mode) => (
                            <Card key={mode}>
                                <CardHeader>
                                    <CardTitle className="capitalize">Modo {mode}</CardTitle>
                                    <CardDescription>Valores aplicados a {mode === 'light' ? 'modo claro' : 'modo oscuro'}.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {editableThemeKeys.map((key) => {
                                        const description = getColorDescription(key)
                                        return (
                                            <div key={`${mode}-${key}`} className="space-y-2">
                                                <div>
                                                    <Label className="text-sm font-medium">{labelForKey(key)}</Label>
                                                    {description && (
                                                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                                                    )}
                                                </div>
                                                {shadowPresetKeys.has(key) ? (
                                                    <ShadowField
                                                        value={theme[mode]?.[key] ?? mergedTheme[mode][key]}
                                                        onChange={(val) => handleChange(mode, key, val)}
                                                    />
                                                ) : colorKeySet.has(key) ? (
                                                    <ColorField
                                                        value={theme[mode]?.[key] ?? mergedTheme[mode][key]}
                                                        onChange={(val) => handleChange(mode, key, val)}
                                                    />
                                                ) : (
                                                    <Input
                                                        value={theme[mode]?.[key] ?? mergedTheme[mode][key]}
                                                        onChange={(e) => handleChange(mode, key, e.target.value)}
                                                        spellCheck={false}
                                                    />
                                                )}
                                            </div>
                                        )
                                    })}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}

const parseThemeFromJson = (value: string): StoreTheme => {
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

const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        resolve(base64)
    }
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
})

const getColorDescription = (key: ThemeKeys): string | undefined => {
    const descriptionMap: Partial<Record<ThemeKeys, string>> = {
        // Colores básicos
        background: 'Color de fondo principal de toda la tienda. Debe contrastar bien con los textos.',
        foreground: 'Color del texto principal. Debe tener alto contraste con el fondo.',
        card: 'Fondo de las tarjetas y componentes. Generalmente un poco más claro/oscuro que el fondo principal.',
        cardForeground: 'Color del texto dentro de las tarjetas.',
        popover: 'Fondo de los menús emergentes y tooltips.',
        popoverForeground: 'Color del texto en los menús emergentes.',

        // Colores primarios y secundarios
        primary: 'Color primario para botones, enlaces y acciones principales. Define la identidad de marca.',
        primaryForeground: 'Color del texto sobre elementos primarios. Debe contrastar con primary.',
        secondary: 'Color secundario para elementos menos prominentes.',
        secondaryForeground: 'Color del texto sobre elementos secundarios.',

        // Estados y énfasis
        muted: 'Color para elementos deshabilitados o menos enfatizados.',
        mutedForeground: 'Color del texto en elementos mutados.',
        accent: 'Color de acento para destacar elementos. Generalmente diferente de primary.',
        accentForeground: 'Color del texto sobre elementos de acento.',
        destructive: 'Color para acciones destructivas (borrar, eliminar). Típicamente rojo.',
        destructiveForeground: 'Color del texto sobre acciones destructivas.',

        // Elementos de interfaz
        border: 'Color de bordes y separadores de componentes.',
        input: 'Color de fondo de campos de entrada de texto.',
        ring: 'Color del anillo de enfoque para accesibilidad y navegación con teclado.',

        // Gráficos
        chart1: 'Color 1 para gráficos y datos. Use colores distintivos para cada serie.',
        chart2: 'Color 2 para gráficos y datos.',
        chart3: 'Color 3 para gráficos y datos.',
        chart4: 'Color 4 para gráficos y datos.',
        chart5: 'Color 5 para gráficos y datos.',

        // Barra lateral
        sidebar: 'Color de fondo de la barra lateral. Generalmente contrasta con el fondo principal.',
        sidebarForeground: 'Color del texto en la barra lateral.',
        sidebarPrimary: 'Color primario usado en la barra lateral (enlaces activos).',
        sidebarPrimaryForeground: 'Color del texto sobre elementos primarios en la barra lateral.',
        sidebarAccent: 'Color de acento en la barra lateral (ítems seleccionados).',
        sidebarAccentForeground: 'Color del texto sobre acentos en la barra lateral.',
        sidebarBorder: 'Color de bordes y separadores en la barra lateral.',
        sidebarRing: 'Color del anillo de enfoque en elementos de la barra lateral.',

        // Sombras
        shadowColor: 'Color base para las sombras. Generalmente negro o gris oscuro. Se aplica a todas las sombras (2xs, xs, sm, etc).',
        shadowOpacity: 'Transparencia de las sombras (0-1). 0 = invisible, 1 = opaco. Típicamente 0.1 a 0.25.',
        shadowBlur: 'Desenfoque de la sombra en píxeles. Mayor valor = sombra más suave. Rango típico: 4-40px.',
        shadowSpread: 'Extensión de la sombra en píxeles. Valores positivos expanden la sombra, negativos la contraen.',
        shadowOffsetX: 'Desplazamiento horizontal de la sombra en píxeles. Negativo = izquierda, positivo = derecha.',
        shadowOffsetY: 'Desplazamiento vertical de la sombra en píxeles. Negativo = arriba, positivo = abajo.',

        // Sombras predefinidas - Sintaxis: offsetX offsetY blur spread color
        shadow2xs: 'Sombra muy sutil. Sintaxis: "0px 1px 2px -1px color, 0px 1px 2px -1px color". Dos capas para profundidad.',
        shadowXs: 'Sombra extra pequeña. Sintaxis: "0px 1px 2px -1px color, 0px 1px 3px -1px color". Elevación leve.',
        shadowSm: 'Sombra pequeña. Sintaxis: "0px 1px 2px -1px color, 0px 2px 4px -2px color". Para componentes ligeros.',
        shadow: 'Sombra estándar. Sintaxis: "0px 1px 3px -1px color, 0px 1px 2px -1px color". Elevación normal.',
        shadowMd: 'Sombra mediana. Sintaxis: "0px 4px 6px -1px color, 0px 2px 4px -2px color". Componentes prominentes.',
        shadowLg: 'Sombra grande. Sintaxis: "0px 10px 15px -3px color, 0px 4px 6px -2px color". Dropdowns y popups.',
        shadowXl: 'Sombra extra grande. Sintaxis: "0px 20px 25px -5px color, 0px 10px 10px -5px color". Elementos destacados.',
        shadow2xl: 'Sombra muy grande. Sintaxis: "0px 25px 50px -12px color". Para modales importantes.',

        // Tipografía y espaciado
        fontSans: 'Fuente sans-serif principal para textos y cuerpo.',
        fontSerif: 'Fuente serif para títulos elegantes (opcional).',
        fontMono: 'Fuente monoespaciada para código y texto técnico.',
        letterSpacing: 'Espaciado entre letras en píxeles o em. Valores negativos aprietan el texto, positivos lo expanden.',
        spacing: 'Unidad de espaciado base. El resto de espacios (padding, margin) se calculan multiplicando este valor.',
        radius: 'Radio de bordes redondeados en píxeles. Define cuán redondeadas son las esquinas de componentes.',
        trackingNormal: 'Rastreo normal de letras. Espaciado estándar entre caracteres.',
    }
    return descriptionMap[key]
}

const labelForKey = (key: ThemeKeys) => {
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
        chart1: 'Gráfico color 1',
        chart2: 'Gráfico color 2',
        chart3: 'Gráfico color 3',
        chart4: 'Gráfico color 4',
        chart5: 'Gráfico color 5',
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
        shadowSpread: 'Extensión sombra',
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

interface ColorFieldProps {
    value: string
    onChange: (value: string) => void
}

const shadowPresets = [
    { id: 'light', label: 'Ligera', value: '0px 2px 6px -2px hsl(0 0% 0% / 0.10)' },
    { id: 'medium', label: 'Media', value: '0px 6px 12px -3px hsl(0 0% 0% / 0.14)' },
    { id: 'high', label: 'Alta', value: '0px 12px 24px -6px hsl(0 0% 0% / 0.18)' },
]

const ColorField = ({ value, onChange }: ColorFieldProps) => {
    const safeValue = value ?? ''
    const preview = toSafeColor(safeValue)

    return (
        <div className="flex items-center gap-2">
            <Input
                value={safeValue}
                onChange={(e) => onChange(e.target.value)}
                spellCheck={false}
            />
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="h-9 w-9 rounded-md border border-border shadow-sm"
                        style={{ background: preview }}
                        aria-label="Seleccionar color"
                    />
                </PopoverTrigger>
                <PopoverContent className="w-72" align="start">
                    <SimpleColorPicker value={preview} onChange={onChange} />
                </PopoverContent>
            </Popover>
        </div>
    )
}

interface ShadowFieldProps {
    value: string
    onChange: (value: string) => void
}

const normalizeShadow = (val: string) => val.replace(/\s+/g, ' ').trim()

const ShadowField = ({ value, onChange }: ShadowFieldProps) => {
    const safeValue = value ?? ''

    const selectedPresetId = useMemo(() => {
        const normalized = normalizeShadow(safeValue)
        const match = shadowPresets.find((preset) => normalizeShadow(preset.value) === normalized)
        return match?.id ?? 'custom'
    }, [safeValue])

    const handlePresetChange = (presetId: string) => {
        if (presetId === 'custom') return
        const preset = shadowPresets.find((item) => item.id === presetId)
        if (preset) onChange(preset.value)
    }

    const previewShadow = safeValue.trim() || 'none'

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <select
                    className="border border-input rounded-md px-2 py-2 bg-background text-sm"
                    value={selectedPresetId}
                    onChange={(e) => handlePresetChange(e.target.value)}
                >
                    <option value="custom">Personalizada (texto)</option>
                    {shadowPresets.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                            {preset.label}
                        </option>
                    ))}
                </select>
            </div>

            <Input
                value={safeValue}
                onChange={(e) => onChange(e.target.value)}
                spellCheck={false}
                placeholder="0px 4px 8px -2px hsl(0 0% 0% / 0.1)"
            />

            <div className="rounded-md border bg-background p-3">
                <div
                    className="h-16 rounded-md border bg-card flex items-center justify-center text-xs text-muted-foreground"
                    style={{ boxShadow: previewShadow }}
                >
                    Vista previa
                </div>
            </div>

            <p className="text-xs text-muted-foreground">
                Sintaxis: offsetX offsetY blur spread color. Puedes escribir tu sombra o elegir un preset (Ligera, Media, Alta).
            </p>
        </div>
    )
}

interface SimpleColorPickerProps {
    value: string
    onChange: (value: string) => void
}

const SimpleColorPicker = ({ value, onChange }: SimpleColorPickerProps) => {
    const parsed = useMemo(() => normalizeColor(value), [value])
    const [hex, setHex] = useState(parsed.hex)
    const [alpha, setAlpha] = useState(parsed.alpha)

    useEffect(() => {
        setHex(parsed.hex)
        setAlpha(parsed.alpha)
    }, [parsed.hex, parsed.alpha])

    const emit = useCallback((nextHex: string, nextAlpha: number) => {
        try {
            const color = Color(nextHex).alpha(nextAlpha)
            onChange(color.rgb().string())
        } catch {
            // ignore invalid input until it becomes a valid color
        }
    }, [onChange])

    const handleHexChange = (nextHex: string) => {
        setHex(nextHex)
        emit(nextHex, alpha)
    }

    const handleAlphaChange = (nextAlpha: number) => {
        setAlpha(nextAlpha)
        emit(hex, nextAlpha)
    }

    const preview = useMemo(() => {
        try {
            return Color(hex).alpha(alpha).string()
        } catch {
            return value
        }
    }, [alpha, hex, value])

    return (
        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
                <input
                    aria-label="Seleccionar color"
                    className="h-10 w-12 cursor-pointer rounded border border-input bg-background"
                    type="color"
                    value={hex}
                    onChange={(e) => handleHexChange(e.target.value)}
                />
                <Input
                    value={hex}
                    onChange={(e) => handleHexChange(e.target.value)}
                    spellCheck={false}
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Opacidad</span>
                    <span>{Math.round(alpha * 100)}%</span>
                </div>
                <input
                    className="h-2 w-full cursor-pointer accent-primary"
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(alpha * 100)}
                    onChange={(e) => handleAlphaChange(Number(e.target.value) / 100)}
                />
            </div>

            <div className="rounded-md border bg-secondary/50 px-2 py-1 text-xs font-mono text-muted-foreground">
                {preview}
            </div>
        </div>
    )
}

const toSafeColor = (value: string) => {
    try {
        return Color(value).hex()
    } catch {
        return '#000000'
    }
}

const normalizeColor = (value: string) => {
    try {
        const color = Color(value)
        return { hex: color.hex(), alpha: color.alpha() }
    } catch {
        return { hex: '#000000', alpha: 1 }
    }
}
