import React from 'react'

export const metadata = {
    title: 'Admin Login - Lea Catalog',
    description: 'Login to the administration panel',
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
