
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div
        className="flex flex-col items-center justify-center gap-6 p-6"
        role="status"
        aria-live="polite"
      >
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
