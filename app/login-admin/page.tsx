"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { Check, Sparkles } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [mode, setMode] = useState<'login' | 'register'>('login')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (mode === 'register') {
                const res = await authClient.signUp.email({
                    email,
                    password,
                    name: name || email.split('@')[0],
                }, {
                    onRequest: () => setLoading(true),
                    onSuccess: () => {
                        toast.success('Cuenta creada, iniciando sesión...')
                        router.push('/admin')
                        router.refresh()
                    },
                    onError: (ctx) => {
                        setError(ctx.error.message || 'No se pudo crear la cuenta')
                        setLoading(false)
                    }
                })

                if (res.error) {
                    setError(res.error.message || 'No se pudo crear la cuenta')
                }
            } else {
                const { data, error: authError } = await authClient.signIn.email({
                    email,
                    password,
                }, {
                    onRequest: () => {
                        setLoading(true)
                    },
                    onSuccess: () => {
                        router.push('/admin')
                        router.refresh()
                    },
                    onError: (ctx) => {
                        setError(ctx.error.message || 'Credenciales inválidas')
                        setLoading(false)
                    }
                })

                if (authError) {
                    setError(authError.message || 'Error al iniciar sesión')
                }
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error')
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
                                {mode === 'register'
                                    ? 'Crear tu cuenta'
                                    : 'Iniciar sesión'}
                            </CardTitle>
                            <CardDescription>
                                {mode === 'register'
                                    ? 'Únete para lanzar tu tienda en Lea Catalog'
                                    : 'Accede con tu correo y continúa donde lo dejaste'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                        {error}
                                    </div>
                                )}

                                {mode === 'register' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="Tu nombre"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo electrónico</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="tu@correo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading
                                            ? (mode === 'register'
                                                ? 'Creando cuenta...'
                                                : 'Iniciando sesión...')
                                            : (mode === 'register'
                                                ? 'Crear cuenta'
                                                : 'Iniciar sesión')}
                                    </Button>

                                    <button
                                        type="button"
                                        className="w-full text-sm font-medium text-primary hover:underline"
                                        onClick={() => {
                                            setMode(mode === 'login' ? 'register' : 'login')
                                            setError('')
                                        }}
                                    >
                                        {mode === 'login'
                                            ? '¿No tienes cuenta? Crea una'
                                            : '¿Ya tienes cuenta? Inicia sesión'}
                                    </button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}