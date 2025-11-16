import React from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { Montserrat } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'

const montserrat = Montserrat({ subsets: ['latin'] })

export const metadata = {
    title: 'Admin - Lea Catalog',
    description: 'Administration panel for Lea Catalog',
}

import '../globals.css'

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
        redirect('/login-admin')
    }

    return (
        <html lang="es">
            <body className={montserrat.className}>
                {children}
                <Toaster />
            </body>
        </html>
    )
}
