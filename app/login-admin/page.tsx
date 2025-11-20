'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'

export default function AdminLoginPage() {
    const router = useRouter()
    const [isSetupMode, setIsSetupMode] = useState(false)
    const [checkingSetup, setCheckingSetup] = useState(true)

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const checkSetup = async () => {
            try {
                const res = await fetch('/api/setup/status')

                if (res.status === 404) {
                    setIsSetupMode(false)
                    return
                }

                if (res.ok) {
                    setIsSetupMode(true)
                }
            } catch (e) {
                console.error('Error al verificar el estado de la configuración', e)
            } finally {
                setCheckingSetup(false)
            }
        }
        checkSetup()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (isSetupMode) {
                const res = await fetch('/api/setup/create-admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                })

                const data = await res.json()

                if (!res.ok) {
                    throw new Error(data.error || 'Error al crear la cuenta de administrador')
                }

                toast.success('¡Cuenta de administrador creada con éxito! Por favor inicie sesión.')
                setIsSetupMode(false)
                // Keep email and password filled for convenience
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

    if (checkingSetup) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="animate-pulse">Cargando...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        {isSetupMode ? 'Crear Cuenta de Administrador' : 'Inicio de Sesión de Administrador'}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {isSetupMode
                            ? 'Configure su primera cuenta de administrador para comenzar'
                            : 'Ingrese sus credenciales para acceder al panel de administración'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                                {error}
                            </div>
                        )}

                        {isSetupMode && (
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Nombre del Administrador"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={isSetupMode}
                                    disabled={loading}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@ejemplo.com"
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

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading
                                ? (isSetupMode ? 'Creando Cuenta...' : 'Iniciando Sesión...')
                                : (isSetupMode ? 'Crear Cuenta de Administrador' : 'Iniciar Sesión')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}