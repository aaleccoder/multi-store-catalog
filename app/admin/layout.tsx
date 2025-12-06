import React from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers, cookies } from 'next/headers'
import { Montserrat } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

const montserrat = Montserrat({ subsets: ['latin'] })

export const metadata = {
    title: 'Admin - Lea Catalog',
    description: 'Catálogo para Lea',
}

import '../globals.css'
import { AdminNav } from '@/components/admin/admin-nav'

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

    const cookieStore = await cookies()
    const activeStoreId = cookieStore.get?.('activeStoreId')?.value

    // Only show sidebar when a store is selected
    const showSidebar = Boolean(activeStoreId)

    return (
        <html lang="es" suppressHydrationWarning>
            <body className={montserrat.className}>
                <SidebarProvider>
                    {showSidebar && <AdminNav />}
                    <SidebarInset>
                        {children}
                    </SidebarInset>
                </SidebarProvider>
                <Toaster />
            </body>
        </html>
    )
}
