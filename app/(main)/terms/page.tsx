import Header from "@/components/wholepage/Header";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-28 lg:pt-32">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Términos de uso
            </p>
            <h1 className="text-4xl font-bold">Condiciones claras para todos</p>
            <p className="text-muted-foreground">
              Al usar la plataforma aceptas estos términos. Si no estás de
              acuerdo, no utilices el servicio.
            </p>
          </div>

          <section className="space-y-3">
            <p className="text-2xl font-semibold">Uso de la plataforma</p>
            <p className="text-muted-foreground">
              Debes proporcionar información veraz y mantener tus credenciales
              seguras. Eres responsable de la actividad que ocurra en tu cuenta.
            </p>
          </section>

          <section className="space-y-3">
            <p className="text-2xl font-semibold">Contenido y propiedad</p>
            <p className="text-muted-foreground">
              Conservas la propiedad de tu contenido. Nos concedes permiso para
              alojarlo y mostrarlo con el fin de operar el servicio.
            </p>
          </section>

          <section className="space-y-3">
            <p className="text-2xl font-semibold">Pagos y planes</p>
            <p className="text-muted-foreground">
              Los planes pueden cambiar. Siempre te avisaremos con antelación
              antes de cualquier modificación relevante.
            </p>
          </section>

          <section className="space-y-3">
            <p className="text-2xl font-semibold">Uso aceptable</p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>No usar la plataforma para actividades ilegales.</li>
              <li>No intentar acceder sin autorización a sistemas o datos.</li>
              <li>No subir contenido que infrinja derechos de terceros.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <p className="text-2xl font-semibold">Limitación de responsabilidad</p>
            <p className="text-muted-foreground">
              El servicio se ofrece “tal cual”. No garantizamos que sea libre de
              interrupciones o errores, aunque trabajamos constantemente en su
              mejora.
            </p>
          </section>

          <section className="space-y-3">
            <p className="text-2xl font-semibold">Cambios en los términos</p>
            <p className="text-muted-foreground">
              Podemos actualizar estos términos. La versión más reciente
              siempre estará disponible en esta página.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
