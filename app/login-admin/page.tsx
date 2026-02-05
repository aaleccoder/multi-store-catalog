"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

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
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<
    Partial<{ email: string; password: string; form: string }>
  >({});
  const [signUpErrors, setSignUpErrors] = useState<
    Partial<{
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      form: string;
    }>
  >({});
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
    if (loginErrors[name as keyof typeof loginErrors]) {
      setLoginErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSignUpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
    if (signUpErrors[name as keyof typeof signUpErrors]) {
      setSignUpErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginErrors({});

    try {
      const validatedData = loginSchema.parse(loginData);

      const { error: authError } = await authClient.signIn.email({
        email: validatedData.email,
        password: validatedData.password,
        callbackURL: "/admin",
      });

      if (authError) {
        let translatedMessage = authError.message;
        if (translatedMessage) {
          if (translatedMessage.includes("Invalid email or password")) {
            translatedMessage = "Correo electrónico o contraseña inválidos";
          } else if (translatedMessage.includes("Account not found")) {
            translatedMessage = "Cuenta no encontrada";
          }
        }
        setLoginErrors({
          form: translatedMessage || "No se pudo iniciar sesión",
        });
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const { fieldErrors } = err.flatten() as {
          fieldErrors: Record<string, string[]>;
        };
        setLoginErrors({
          email: fieldErrors.email?.[0],
          password: fieldErrors.password?.[0],
        });
      } else {
        setLoginErrors({
          form: err.message || "Ocurrió un error al iniciar sesión",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSignUpErrors({});

    try {
      const validatedData = signUpSchema.parse(signUpData);

      const { error: authError } = await authClient.signUp.email({
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
        callbackURL: "/admin",
      });

      if (authError) {
        let translatedMessage = authError.message;
        if (translatedMessage) {
          if (translatedMessage.includes("already exists")) {
            translatedMessage = "El usuario ya existe";
          } else if (translatedMessage.includes("Invalid email")) {
            translatedMessage = "Correo electrónico inválido";
          } else if (translatedMessage.includes("too weak")) {
            translatedMessage = "La contraseña es demasiado débil";
          }
        }
        setSignUpErrors({ form: translatedMessage || "No se pudo registrar" });
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const { fieldErrors } = err.flatten() as {
          fieldErrors: Record<string, string[]>;
        };
        setSignUpErrors({
          name: fieldErrors.name?.[0],
          email: fieldErrors.email?.[0],
          password: fieldErrors.password?.[0],
          confirmPassword: fieldErrors.confirmPassword?.[0],
        });
      } else {
        setSignUpErrors({
          form: err.message || "Ocurrió un error al registrarse",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Left side - App Screenshot */}
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden p-8" style={{ backgroundColor: 'var(--muted)' }}>
        {/* Decorative elements using primary/accent colors */}
        <div className="absolute top-20 left-20 w-72 h-72 blur-3xl" style={{ backgroundColor: 'var(--primary)', opacity: 0.15 }} />
        <div className="absolute bottom-20 right-20 w-96 h-96 blur-3xl" style={{ backgroundColor: 'var(--accent)', opacity: 0.15 }} />

        {/* Screenshot Image with Animated Border Outside */}
        <div className="relative z-10 w-full max-w-3xl p-2">
          {/* Animated border wrapper - outside the image */}
          <div className="relative overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--card)' }}>
            {/* Prominent animated border on the outside */}
            <div className="absolute -inset-[3px] pointer-events-none border-trace" />

            <Image
              src="/landing1.png"
              alt="Vista previa del Panel de Control"
              width={1200}
              height={800}
              className="w-full h-auto object-cover relative z-10"
              priority
            />
          </div>
        </div>
      </div>

      {/* Right side - Login/Signup Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 py-12" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-sm mx-auto w-full">
          {/* Back to website */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm transition-colors mb-8"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al sitio web
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden shadow-md" style={{ backgroundColor: 'var(--primary)' }}>
              <Image
                src="/android-chrome-512x512.png"
                alt="Logo de Catalog"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="font-semibold text-xl" style={{ color: 'var(--foreground)' }}>Catalog</span>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 mb-6" style={{ backgroundColor: 'var(--muted)' }}>
            <button
              onClick={() => setActiveTab("login")}
              className={`py-2 px-4 text-sm font-medium transition-all ${activeTab === "login" ? "shadow-sm" : ""
                }`}
              style={{
                backgroundColor: activeTab === "login" ? 'var(--background)' : 'transparent',
                color: activeTab === "login" ? 'var(--foreground)' : 'var(--muted-foreground)'
              }}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`py-2 px-4 text-sm font-medium transition-all ${activeTab === "signup" ? "shadow-sm" : ""
                }`}
              style={{
                backgroundColor: activeTab === "signup" ? 'var(--background)' : 'transparent',
                color: activeTab === "signup" ? 'var(--foreground)' : 'var(--muted-foreground)'
              }}
            >
              Crear cuenta
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <>
              {/* Heading */}
              <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                Inicia sesión en tu cuenta
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
                Administra tus productos y tiendas fácilmente.
              </p>

              <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                {loginErrors.form && (
                  <div className="border p-3 text-sm" style={{ borderColor: 'var(--destructive)', color: 'var(--destructive)', backgroundColor: 'var(--destructive)', opacity: 0.1 }}>
                    {loginErrors.form}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    Correo electrónico<span style={{ color: 'var(--destructive)' }}>*</span>
                  </Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="Ingresa tu correo electrónico"
                    value={loginData.email}
                    onChange={handleLoginInputChange}
                    className="h-10"
                    style={{ backgroundColor: 'var(--background)' }}
                  />
                  {loginErrors.email && (
                    <p className="text-xs" style={{ color: 'var(--destructive)' }}>{loginErrors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    Contraseña<span style={{ color: 'var(--destructive)' }}>*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••••••"
                      value={loginData.password}
                      onChange={handleLoginInputChange}
                      className="h-10 pr-10"
                      style={{ backgroundColor: 'var(--background)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="text-xs" style={{ color: 'var(--destructive)' }}>{loginErrors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm hover:underline transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 text-primary-foreground"
                  disabled={loading}
                  style={{ backgroundColor: 'var(--foreground)' }}
                >
                  {loading ? "Iniciando sesión..." : "Iniciar sesión en Catalog"}
                </Button>
              </form>
            </>
          )}

          {/* Sign Up Form */}
          {activeTab === "signup" && (
            <>
              {/* Heading */}
              <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                Crea tu cuenta
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
                Comienza a gestionar tus productos y tiendas.
              </p>

              <form onSubmit={handleSignUpSubmit} className="space-y-4" noValidate>
                {signUpErrors.form && (
                  <div className="border p-3 text-sm" style={{ borderColor: 'var(--destructive)', color: 'var(--destructive)', backgroundColor: 'var(--destructive)', opacity: 0.1 }}>
                    {signUpErrors.form}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="signup-name" className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    Nombre<span style={{ color: 'var(--destructive)' }}>*</span>
                  </Label>
                  <Input
                    id="signup-name"
                    name="name"
                    type="text"
                    placeholder="Ingresa tu nombre"
                    value={signUpData.name}
                    onChange={handleSignUpInputChange}
                    className="h-10"
                    style={{ backgroundColor: 'var(--background)' }}
                  />
                  {signUpErrors.name && (
                    <p className="text-xs" style={{ color: 'var(--destructive)' }}>{signUpErrors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    Correo electrónico<span style={{ color: 'var(--destructive)' }}>*</span>
                  </Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Ingresa tu correo electrónico"
                    value={signUpData.email}
                    onChange={handleSignUpInputChange}
                    className="h-10"
                    style={{ backgroundColor: 'var(--background)' }}
                  />
                  {signUpErrors.email && (
                    <p className="text-xs" style={{ color: 'var(--destructive)' }}>{signUpErrors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    Contraseña<span style={{ color: 'var(--destructive)' }}>*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={signUpData.password}
                      onChange={handleSignUpInputChange}
                      className="h-10 pr-10"
                      style={{ backgroundColor: 'var(--background)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {signUpErrors.password && (
                    <p className="text-xs" style={{ color: 'var(--destructive)' }}>{signUpErrors.password}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-confirm-password" className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    Confirmar contraseña<span style={{ color: 'var(--destructive)' }}>*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repite tu contraseña"
                      value={signUpData.confirmPassword}
                      onChange={handleSignUpInputChange}
                      className="h-10 pr-10"
                      style={{ backgroundColor: 'var(--background)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {signUpErrors.confirmPassword && (
                    <p className="text-xs" style={{ color: 'var(--destructive)' }}>{signUpErrors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 text-primary-foreground"
                  disabled={loading}
                  style={{ backgroundColor: 'var(--foreground)' }}
                >
                  {loading ? "Creando cuenta..." : "Crear cuenta en Catalog"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
