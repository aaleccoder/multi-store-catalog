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
        <html lang="en" suppressHydrationWarning>
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}