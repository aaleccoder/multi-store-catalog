import type { Metadata } from 'next'
import Providers from './providers'
import "@/app/globals.css"

export const metadata: Metadata = {
    title: 'Lea catálogo',
    description: 'Catálogo para Lea',
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}