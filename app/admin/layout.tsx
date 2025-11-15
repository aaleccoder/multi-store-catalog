import React from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export const metadata = {
    title: 'Admin - Lea Catalog',
    description: 'Administration panel for Lea Catalog',
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Verify session server-side
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect('/admin/login')
    }

    return (
        <html lang="es">
            <body>
                {children}
            </body>
        </html>
    )
}
