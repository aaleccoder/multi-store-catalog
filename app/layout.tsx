import type { Metadata } from 'next'

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
                {children}
            </body>
        </html>
    )
}