"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { Check, Sparkles } from "lucide-react";
import { z } from "zod";
import { useRouter } from "next/navigation";

// Zod schema for login
const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// Zod schema for sign-up
const signUpSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    email: z.string().email("Correo electrónico inválido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const router = useRouter();

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate with Zod
      const validatedData = loginSchema.parse(loginData);

      const { error: authError } = await authClient.signIn.email({
        email: validatedData.email,
        password: validatedData.password,
        callbackURL: "/admin",
      });

      if (authError) {
        setError(authError.message || "No se pudo iniciar sesión");
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message || "Datos inválidos");
      } else {
        setError(err.message || "Ocurrió un error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate with Zod
      const validatedData = signUpSchema.parse(signUpData);

      const { error: authError } = await authClient.signUp.email({
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
        callbackURL: "/admin",
      });

      if (authError) {
        setError(authError.message || "No se pudo registrar");
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message || "Datos inválidos");
      } else {
        setError(err.message || "Ocurrió un error al registrarse");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.12),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.12),transparent_25%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,0.12),transparent_30%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-10 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6 text-foreground">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Nueva etapa: crea tu tienda
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold leading-tight md:text-4xl">
                Bienvenido a Lea Catalog
              </h1>
              <p className="text-base text-muted-foreground md:text-lg">
                Regístrate o inicia sesión para crear tus tiendas, subir
                productos y gestionar tu catálogo en minutos.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-muted-foreground">
              {[
                "Crea tu primera tienda en pocos pasos",
                "Gestiona productos, categorías y variantes",
                "Invita a tu equipo cuando estés listo",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="w-full border-border/60 bg-card/90 shadow-xl backdrop-blur">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-semibold">
                Accede a tu cuenta
              </CardTitle>
              <CardDescription>
                Inicia sesión o regístrate para gestionar tus tiendas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                  <TabsTrigger value="signup">Registrarse</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {error && (
                      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="login-email">Correo electrónico</Label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        value={loginData.email}
                        onChange={handleLoginInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Contraseña</Label>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        value={loginData.password}
                        onChange={handleLoginInputChange}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      variant="default"
                      disabled={loading}
                    >
                      {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup">
                  <form onSubmit={handleSignUpSubmit} className="space-y-4">
                    {error && (
                      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nombre</Label>
                      <Input
                        id="signup-name"
                        name="name"
                        type="text"
                        value={signUpData.name}
                        onChange={handleSignUpInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Correo electrónico</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        value={signUpData.email}
                        onChange={handleSignUpInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Contraseña</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        value={signUpData.password}
                        onChange={handleSignUpInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">
                        Confirmar contraseña
                      </Label>
                      <Input
                        id="signup-confirm-password"
                        name="confirmPassword"
                        type="password"
                        value={signUpData.confirmPassword}
                        onChange={handleSignUpInputChange}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      variant="default"
                      disabled={loading}
                    >
                      {loading ? "Registrando..." : "Registrarse"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
