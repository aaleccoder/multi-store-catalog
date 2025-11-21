
import LogoProps from "@/components/logo"

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div
                className="flex flex-col items-center justify-center gap-6 p-6"
                role="status"
                aria-live="polite"
            >
                <LogoProps className="h-32 w-32 text-[#c90606]" aria-hidden={false} />
                <div className="w-8 h-8 border-4 border-[#c90606] border-t-transparent rounded-full animate-spin"></div>

                <span className="sr-only">Loading content...</span>
            </div>
        </div>
    )
}