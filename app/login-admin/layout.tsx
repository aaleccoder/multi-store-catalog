import React from 'react'

export const metadata = {
    title: 'Acceso - Lea Catalog',
    description: 'Inicia sesión o crea tu cuenta para gestionar tus tiendas',
}

import '../globals.css'

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // No authentication check for login page
    return (
        <html lang="es">
            <body>
                {children}
            </body>
        </html>
    )
}
