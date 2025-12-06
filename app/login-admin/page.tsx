"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'
import { Check, Sparkles } from 'lucide-react'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleGoogleSignIn = async () => {
        setLoading(true)
        setError('')

        try {
            const { error: authError } = await authClient.signIn.social({
                provider: 'google',
                callbackURL: '/admin',
            })

            if (authError) {
                setError(authError.message || 'No se pudo iniciar sesión con Google')
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al conectar con Google')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-background">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.12),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.12),transparent_25%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,0.12),transparent_30%)]" />

            <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-10 lg:px-10">
                <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                    <div className="space-y-6 text-foreground">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            <Sparkles className="h-4 w-4" />
                            Nueva etapa: crea tu tienda
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-bold leading-tight md:text-4xl">
                                Bienvenido a Lea Catalog
                            </h1>
                            <p className="text-base text-muted-foreground md:text-lg">
                                Regístrate o inicia sesión para crear tus tiendas, subir productos y gestionar tu catálogo en minutos.
                            </p>
                        </div>
                        <div className="grid gap-3 text-sm text-muted-foreground">
                            {["Crea tu primera tienda en pocos pasos", "Gestiona productos, categorías y variantes", "Invita a tu equipo cuando estés listo"].map((item) => (
                                <div key={item} className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Check className="h-3.5 w-3.5" />
                                    </span>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Card className="w-full border-border/60 bg-card/90 shadow-xl backdrop-blur">
                        <CardHeader className="space-y-2 text-center">
                            <CardTitle className="text-2xl font-semibold">
                                Accede con Google
                            </CardTitle>
                            <CardDescription>
                                Usa tu cuenta de Google para entrar y gestionar tus tiendas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {error && (
                                    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="button"
                                    className="w-full"
                                    variant="default"
                                    disabled={loading}
                                    onClick={handleGoogleSignIn}
                                >
                                    {loading ? 'Redirigiendo...' : 'Continuar con Google'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}