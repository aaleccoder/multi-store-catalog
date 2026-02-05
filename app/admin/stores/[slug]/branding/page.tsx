'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { trpc } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { defaultStoreBranding, defaultStoreTheme, StoreTheme } from '@/lib/theme'
import { defaultStoreFontId } from '@/lib/store-fonts'
import { BrandingCard } from '../theme/components/branding-card'
import { fileToBase64 } from '../theme/theme-utils'

export default function SettingsPage() {
    const router = useRouter()
    const params = useParams()
    const storeSlug = typeof params?.slug === 'string' ? params.slug : ''

    const { data: store, isLoading: storeLoading, refetch: refetchStore } = trpc.admin.stores.getBySlug.useQuery(storeSlug, {
        enabled: !!storeSlug,
    })

    const utils = trpc.useUtils()
    const uploadMedia = trpc.admin.media.upload.useMutation()

    const updateStore = trpc.admin.stores.update.useMutation({
        onSuccess: async () => {
            if (storeSlug) {
                await utils.admin.stores.getBySlug.invalidate(storeSlug)
            }
        },
    })

    type StoreWithTheme = { id: string; name: string; theme?: unknown }
    const activeStore = (store as StoreWithTheme | undefined) ?? null
    const activeStoreId = activeStore?.id ?? ''

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

    const [themeDraft, setThemeDraft] = useState<StoreTheme | null>(null)

    const theme = useMemo<StoreTheme>(() => themeDraft ?? baseTheme, [baseTheme, themeDraft])
    const branding = theme.branding ?? defaultStoreBranding

    const handleBrandingChange = (key: keyof NonNullable<StoreTheme['branding']>, value: string | number | undefined) => {
        if (!activeStoreId) return

        setThemeDraft((prev) => {
            const current = prev ?? baseTheme

            return {
                ...current,
                branding: {
                    ...(current.branding ?? defaultStoreBranding),
                    [key]: value === '' ? undefined : value,
                },
            }
        })
    }

    const handleLogoFile = async (file: File) => {
        if (!activeStoreId) return
        try {
            const base64 = await fileToBase64(file)
            const uploaded = await uploadMedia.mutateAsync({
                storeId: activeStoreId,
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

    const handleSave = async () => {
        if (!activeStoreId) {
            toast.error('Selecciona una tienda')
            return
        }

        try {
            const nextTheme = themeDraft ?? baseTheme
            await updateStore.mutateAsync({ id: activeStoreId, data: { theme: nextTheme } })
            await refetchStore()
            setThemeDraft(null)
            router.refresh()
            toast.success('Identidad actualizada')
        } catch {
            toast.error('No se pudo guardar la identidad')
        }
    }

    if (storeLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!store && !storeLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">No se encontro la tienda solicitada.</p>
                <Button asChild>
                    <Link href="/admin/stores">Volver</Link>
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
                            <h1 className="text-3xl font-bold">Configuración de la tienda</h1>
                            <p className="text-sm text-muted-foreground">Gestiona la configuración general de tu tienda.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href={`/admin/stores/${storeSlug}/theme`}>Volver al tema</Link>
                            </Button>
                            <Button onClick={handleSave} disabled={updateStore.isPending}>
                                {updateStore.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Identidad de la tienda</CardTitle>
                                <CardDescription>Logo, datos de contacto y redes sociales.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <BrandingCard
                                    branding={branding}
                                    onBrandingChange={handleBrandingChange}
                                    onLogoFile={handleLogoFile}
                                    uploading={uploadMedia.isPending}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
