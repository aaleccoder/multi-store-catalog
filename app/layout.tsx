import type { Metadata } from 'next'
import Providers from './providers'

export const metadata: Metadata = {
    title: 'Wapa catálogo',
    description: 'Catálogo para Wapa',
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