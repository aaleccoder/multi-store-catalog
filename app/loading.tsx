import Image from "next/image";


export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div
        className="flex flex-col items-center justify-center gap-6 p-6"
        role="status"
        aria-live="polite"
      >
        <Image src="/android-icon-192x192.png" height={64} width={64} alt="App Icon" className="w-24 h-24 mb-4" />
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
        </div>
        <p className="text-foreground text-sm animate-pulse">Cargando...</p>
        <span className="sr-only">Cargando...</span>
      </div>
    </div>
  );
}
