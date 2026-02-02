'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { defaultStoreBranding, defaultStoreTheme, mergeTheme, StoreTheme, ThemeKeys } from '@/lib/theme'
import { defaultStoreFontId, StoreFontId } from '@/lib/store-fonts'
import { ThemeHeader } from './components/theme-header'
import { ImportThemeCard } from './components/import-theme-card'
import { ShadowHelpCard } from './components/shadow-help-card'
import { BrandingCard } from './components/branding-card'
import { FontCard } from './components/font-card'
import { ThemeModeCard } from './components/theme-mode-card'
import { fileToBase64, parseThemeFromJson } from './theme-utils'
import Link from 'next/link'

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
                    <Link href="/admin/stores">Crear tienda</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="md:pt-20 lg:pt-0">
                <div className="p-4 md:p-8 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <ThemeHeader
                            stores={normalizedStores}
                            activeStoreId={activeStoreId}
                            onStoreChange={setSelectedStoreId}
                            onSave={handleSave}
                            saving={updateStore.isPending}
                        />
                    </div>
                    <ImportThemeCard
                        value={importText}
                        onChange={setImportText}
                        onImport={handleImport}
                        disabled={!importText.trim()}
                    />

                    <ShadowHelpCard />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <BrandingCard
                            branding={branding}
                            onBrandingChange={handleBrandingChange}
                            onLogoFile={handleLogoFile}
                            uploading={uploadMedia.isPending}
                        />

                        <FontCard
                            selectedFontId={selectedFontId}
                            onChange={handleFontChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {(['light', 'dark'] as const).map((mode) => (
                            <ThemeModeCard
                                key={mode}
                                mode={mode}
                                theme={theme}
                                mergedTheme={mergedTheme}
                                onChange={handleChange}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
