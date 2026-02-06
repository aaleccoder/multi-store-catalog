"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, Instagram, Facebook, Twitter } from "lucide-react";
import Header from "@/components/wholepage/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
  phone: "",
  company: "",
};

type ValidationErrors = Partial<Record<keyof typeof initialForm, string>>;

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof typeof initialForm, boolean>>>({});

  const sendContact = trpc.contact.send.useMutation({
    onSuccess: () => {
      toast.success("Mensaje enviado. Te responderemos pronto.");
      setForm(initialForm);
      setErrors({});
      setTouched({});
    },
    onError: (error) => {
      toast.error("No se pudo enviar el mensaje.", {
        description: error.message,
      });
    },
  });

  const validateField = (field: keyof typeof initialForm, value: string): string | undefined => {
    switch (field) {
      case "name":
        if (!value.trim()) return "El nombre es requerido";
        if (value.trim().length < 2) return "El nombre debe tener al menos 2 caracteres";
        if (value.trim().length > 100) return "El nombre es demasiado largo";
        break;

      case "email":
        if (!value.trim()) return "El correo electrónico es requerido";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return "Ingresa un correo electrónico válido";
        break;

      case "subject":
        if (!value.trim()) return "El asunto es requerido";
        if (value.trim().length < 3) return "El asunto debe tener al menos 3 caracteres";
        if (value.trim().length > 200) return "El asunto es demasiado largo";
        break;

      case "message":
        if (!value.trim()) return "El mensaje es requerido";
        if (value.trim().length < 10) return "El mensaje debe tener al menos 10 caracteres";
        if (value.trim().length > 2000) return "El mensaje es demasiado largo";
        break;

      case "phone":
        if (value.trim() && value.trim().length < 8) return "Ingresa un número de teléfono válido";
        if (value.trim() && value.trim().length > 20) return "El número de teléfono es demasiado largo";
        break;

      case "company":
        if (value.trim() && value.trim().length > 100) return "El nombre de la empresa es demasiado largo";
        break;
    }
    return undefined;
  };

  const handleChange = (
    field: keyof typeof initialForm,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // Validate immediately if field was already touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    }
  };

  const handleBlur = (field: keyof typeof initialForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field]);
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(form).reduce((acc, key) => ({
      ...acc,
      [key]: true,
    }), {} as Record<keyof typeof initialForm, boolean>);
    setTouched(allTouched);

    // Validate all fields
    const newErrors: ValidationErrors = {};
    let hasErrors = false;

    (Object.keys(form) as Array<keyof typeof initialForm>).forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    if (hasErrors) {
      toast.error("Por favor, corrige los errores en el formulario");
      return;
    }

    sendContact.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      phone: form.phone.trim() || undefined,
      company: form.company.trim() || undefined,
    });
  };

  const isFormValid = Object.keys(form).every((field) => {
    const key = field as keyof typeof initialForm;
    const error = validateField(key, form[key]);
    return !error;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-28 lg:pt-32">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Contacto
            </p>
            <h1 className="text-4xl font-bold">Hablemos</p>
            <p className="text-muted-foreground">
              Cuéntanos sobre tu tienda y te ayudamos a empezar.
            </p>
          </div>

          <form
            className="space-y-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Input
                  placeholder="Nombre completo"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  className={errors.name && touched.name ? "border-destructive" : ""}
                  required
                />
                {touched.name && errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>
              <div className="space-y-1">
                <Input
                  type="email"
                  placeholder="Correo electrónico"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={errors.email && touched.email ? "border-destructive" : ""}
                  required
                />
                {touched.email && errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Input
                  placeholder="Empresa (opcional)"
                  value={form.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  onBlur={() => handleBlur("company")}
                  className={errors.company && touched.company ? "border-destructive" : ""}
                />
                {touched.company && errors.company && (
                  <p className="text-xs text-destructive">{errors.company}</p>
                )}
              </div>
              <div className="space-y-1">
                <Input
                  placeholder="Teléfono (opcional)"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  onBlur={() => handleBlur("phone")}
                  className={errors.phone && touched.phone ? "border-destructive" : ""}
                />
                {touched.phone && errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Input
                placeholder="Asunto"
                value={form.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                onBlur={() => handleBlur("subject")}
                className={errors.subject && touched.subject ? "border-destructive" : ""}
                required
              />
              {touched.subject && errors.subject && (
                <p className="text-xs text-destructive">{errors.subject}</p>
              )}
            </div>
            <div className="space-y-1">
              <Textarea
                placeholder="Cuéntanos en qué podemos ayudarte..."
                value={form.message}
                onChange={(e) => handleChange("message", e.target.value)}
                onBlur={() => handleBlur("message")}
                className={`min-h-40 ${errors.message && touched.message ? "border-destructive" : ""}`}
                required
              />
              {touched.message && errors.message && (
                <p className="text-xs text-destructive">{errors.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Te responderemos en menos de 24 horas hábiles.
              </p>
              <Button
                type="submit"
                disabled={sendContact.isPending || !isFormValid}
                className="h-11 px-8"
              >
                {sendContact.isPending ? "Enviando..." : "Enviar mensaje"}
              </Button>
            </div>
          </form>

          <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <p className="text-lg font-semibold">Información de contacto</p>
            <p className="text-sm text-muted-foreground">
              También puedes contactarnos directamente a través de:
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href="mailto:wavelikeonline111@gmail.com"
                className="flex items-center gap-3 rounded-lg border border-border/40 p-3 transition-colors hover:bg-accent"
              >
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="truncate text-sm font-medium">wavelikeonline111@gmail.com</p>
                </div>
              </a>

              <div className="flex flex-col gap-2">
                <a
                  href="tel:+5359365880"
                  className="flex items-center gap-3 rounded-lg border border-border/40 p-3 transition-colors hover:bg-accent"
                >
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="text-sm font-medium">+53 5 936 5880</p>
                  </div>
                </a>
                <a
                  href="tel:+5355817532"
                  className="flex items-center gap-3 rounded-lg border border-border/40 p-3 transition-colors hover:bg-accent"
                >
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="text-sm font-medium">+53 5 581 7532</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="pt-2">
              <p className="mb-3 text-sm font-medium">Síguenos en redes sociales</p>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com/wavelikeonline"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/40 transition-colors hover:bg-accent"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com/wavelikeonline"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/40 transition-colors hover:bg-accent"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://facebook.com/wavelikeonline"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/40 transition-colors hover:bg-accent"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
