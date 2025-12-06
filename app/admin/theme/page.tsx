'use client'

import { useMemo, useState } from 'react'
import { trpc } from '@/trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Palette } from 'lucide-react'
import { toast } from 'sonner'
import { defaultStoreTheme, mergeTheme, StoreTheme, ThemeKeys, ThemeModeOverrides, defaultLightTheme } from '@/lib/theme'

const themeKeys = Object.keys(defaultLightTheme) as ThemeKeys[]
const themeKeySet = new Set<ThemeKeys>(themeKeys)

export default function ThemePage() {
    const { data: stores, isLoading: storesLoading } = trpc.admin.stores.list.useQuery()
    const updateStore = trpc.admin.stores.update.useMutation()

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
        }
    }, [activeStore])

    const theme = useMemo<StoreTheme>(() => {
        if (!activeStoreId) return baseTheme
        return themeDrafts[activeStoreId] ?? baseTheme
    }, [activeStoreId, baseTheme, themeDrafts])

    const mergedTheme = useMemo(() => mergeTheme(theme), [theme])

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

    const handleSave = async () => {
        if (!activeStoreId) {
            toast.error('Selecciona una tienda')
            return
        }
        try {
            await updateStore.mutateAsync({ id: activeStoreId, data: { theme } })
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {(['light', 'dark'] as const).map((mode) => (
                            <Card key={mode}>
                                <CardHeader>
                                    <CardTitle className="capitalize">Modo {mode}</CardTitle>
                                    <CardDescription>Valores aplicados a {mode === 'light' ? 'modo claro' : 'modo oscuro'}.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {themeKeys.map((key) => (
                                        <div key={`${mode}-${key}`} className="space-y-2">
                                            <Label className="text-sm font-medium">{labelForKey(key)}</Label>
                                            <Input
                                                value={mergedTheme[mode][key]}
                                                onChange={(e) => handleChange(mode, key, e.target.value)}
                                                spellCheck={false}
                                            />
                                        </div>
                                    ))}
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

    return {
        light: normalizeMode((parsed as { light?: unknown }).light),
        dark: normalizeMode((parsed as { dark?: unknown }).dark),
    }
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
        ring: 'Anillo',
        chart1: 'Chart 1',
        chart2: 'Chart 2',
        chart3: 'Chart 3',
        chart4: 'Chart 4',
        chart5: 'Chart 5',
        sidebar: 'Sidebar',
        sidebarForeground: 'Texto sidebar',
        sidebarPrimary: 'Primario sidebar',
        sidebarPrimaryForeground: 'Texto primario sidebar',
        sidebarAccent: 'Acento sidebar',
        sidebarAccentForeground: 'Texto acento sidebar',
        sidebarBorder: 'Borde sidebar',
        sidebarRing: 'Anillo sidebar',
        fontSans: 'Fuente sans',
        fontSerif: 'Fuente serif',
        fontMono: 'Fuente mono',
        radius: 'Radio',
        shadowColor: 'Color sombra',
        shadowOpacity: 'Opacidad sombra',
        shadowBlur: 'Desenfoque sombra',
        shadowSpread: 'Extensión sombra',
        shadowOffsetX: 'Desplazamiento X',
        shadowOffsetY: 'Desplazamiento Y',
        letterSpacing: 'Espaciado letras',
        spacing: 'Espaciado base',
        shadow2xs: 'Sombra 2xs',
        shadowXs: 'Sombra xs',
        shadowSm: 'Sombra sm',
        shadow: 'Sombra',
        shadowMd: 'Sombra md',
        shadowLg: 'Sombra lg',
        shadowXl: 'Sombra xl',
        shadow2xl: 'Sombra 2xl',
        trackingNormal: 'Tracking',
    }
    return labelMap[key] ?? key
}
