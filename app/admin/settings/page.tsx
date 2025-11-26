"use client"

import { trpc } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

type ContactSettings = {
    email: string
    phoneNumber: string
    address: string
}

export default function SettingsPage() {
    const { data: settingsData, isLoading, refetch } = trpc.admin.settings.list.useQuery()
    const updateSettings = trpc.admin.settings.update.useMutation({
        onSuccess: () => {
            toast.success('Configuración actualizada correctamente')
            refetch()
        },
        onError: (err: any) => {
            toast.error('Error al actualizar la configuración', { description: err.message })
        }
    })

    const [contact, setContact] = useState<ContactSettings>({
        email: '',
        phoneNumber: '',
        address: ''
    })

    useEffect(() => {
        if (settingsData?.settings) {
            const settings = settingsData.settings as any
            if (settings.contact) {
                setContact(settings.contact)
            }
        }
    }, [settingsData])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateSettings.mutate({
            contact
        })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="md:pt-20 lg:pt-0">
                <div className="p-8">
                    <h1 className="text-3xl font-bold mb-6">Configuración General</h1>

                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Información de Contacto</CardTitle>
                                <CardDescription>
                                    Administra la información de contacto que se mostrará en el sitio web
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={contact.email}
                                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                        placeholder="contacto@ejemplo.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Número de Teléfono</Label>
                                    <Input
                                        id="phoneNumber"
                                        type="tel"
                                        value={contact.phoneNumber}
                                        onChange={(e) => setContact({ ...contact, phoneNumber: e.target.value })}
                                        placeholder="+1 (555) 123-4567"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Dirección</Label>
                                    <Textarea
                                        id="address"
                                        value={contact.address}
                                        onChange={(e) => setContact({ ...contact, address: e.target.value })}
                                        placeholder="Calle Principal #123, Ciudad, País"
                                        required
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={updateSettings.isPending}
                                    >
                                        {updateSettings.isPending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Guardar Cambios
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </main>
        </div>
    )
}
