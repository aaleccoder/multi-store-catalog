
import Logo from "@/components/layout/logo"

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div
                className="flex flex-col items-center justify-center gap-6 p-6"
                role="status"
                aria-live="polite"
            >
                <Logo className="h-32 w-32" aria-hidden={false} />
                <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"></div>

                <span className="sr-only">Loading content...</span>
            </div>
        </div >
    )
}