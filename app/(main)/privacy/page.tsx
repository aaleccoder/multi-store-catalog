import Header from "@/components/wholepage/Header";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-28 lg:pt-32">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Política de privacidad
            </p>
            <h1 className="text-4xl font-bold">Tu privacidad es prioridad</h1>
            <p className="text-muted-foreground">
              Esta política describe qué datos recopilamos, cómo los usamos y tus
              derechos sobre tu información.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Información que recopilamos</h2>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Datos de cuenta y contacto (nombre, correo, teléfono).</li>
              <li>Información de la tienda y catálogos que administras.</li>
              <li>Datos técnicos básicos para el funcionamiento del servicio.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Cómo usamos la información</h2>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Operar y mejorar la plataforma de catálogos.</li>
              <li>Brindar soporte, notificaciones y actualizaciones.</li>
              <li>Prevenir fraude y asegurar el cumplimiento de políticas.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Compartición de datos</h2>
            <p className="text-muted-foreground">
              No vendemos tu información. Solo compartimos datos con proveedores
              necesarios para operar el servicio, bajo acuerdos de
              confidencialidad y seguridad.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Tus derechos</h2>
            <p className="text-muted-foreground">
              Puedes solicitar acceso, rectificación o eliminación de tus datos.
              También puedes solicitar una copia de la información que tenemos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Contacto</h2>
            <p className="text-muted-foreground">
              Para consultas de privacidad, contáctanos a través de la página de
              contacto.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
