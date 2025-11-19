import type { Metadata } from 'next'
import Providers from './providers'

export const metadata: Metadata = {
    title: 'Catalog App',
    description: 'A catalog application',
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