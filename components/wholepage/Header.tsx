"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import {
  ChevronDown,
  LifeBuoy,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogoutDialog } from "@/components/ui/logout-dialog";
import { ModeToggle } from "../mode-toogle";

export default function Header() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const helpCloseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    return () => {
      if (helpCloseTimeout.current) {
        clearTimeout(helpCloseTimeout.current);
      }
    };
  }, []);

  const openHelpMenu = () => {
    if (helpCloseTimeout.current) {
      clearTimeout(helpCloseTimeout.current);
      helpCloseTimeout.current = null;
    }
    setIsHelpOpen(true);
  };

  const closeHelpMenu = () => {
    if (helpCloseTimeout.current) {
      clearTimeout(helpCloseTimeout.current);
    }
    helpCloseTimeout.current = setTimeout(() => {
      setIsHelpOpen(false);
    }, 120);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    setIsDialogOpen(false);
    router.push("/login-admin");
  };

  const openLogoutDialog = () => {
    setIsMobileOpen(false);
    setIsDialogOpen(true);
  };

  const navigate = (path: string) => {
    router.push(path);
    setIsMobileOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b-2 border-border p-4 backdrop-blur-xl transition-all"
          }`}
      >
        <div className="mx-auto max-w-9xl px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="link"
              className="h-fit w-fit p-0 hover:scale-105 cursor-pointer hover:no-underline"
              onClick={() => router.push("/")}
            >
              <div>
                <Image
                  src="/apple-icon.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="rounded"
                />
                <div>
                  <h1 className="text-2xl font-bold text-foreground hidden md:block">Una Ganga - Catálogos</h1>
                </div>

              </div>
            </Button>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-foreground hover:text-foreground"
              onClick={() => router.push("/#stores")}
            >
              Tiendas
            </Button>
            <Button
              variant="ghost"
              className="text-foreground hover:text-foreground"
              onClick={() => router.push("/info")}
            >
              Planes
            </Button>
            <DropdownMenu open={isHelpOpen} onOpenChange={setIsHelpOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-foreground"
                  onMouseEnter={openHelpMenu}
                  onMouseLeave={closeHelpMenu}
                  onFocus={openHelpMenu}
                >
                  Help
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[340px] rounded-2xl border-border/20 bg-background/90 p-3 shadow-2xl backdrop-blur-xl"
                onMouseEnter={openHelpMenu}
                onMouseLeave={closeHelpMenu}
              >
                <div className="px-2 pb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ayuda y legal
                  </p>
                </div>
                <DropdownMenuItem
                  className="rounded-xl p-2"
                  onSelect={() => router.push("/terms")}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ScrollText className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Términos de uso</span>
                      <span className="text-xs text-muted-foreground">
                        Condiciones y reglas de la plataforma.
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl p-2"
                  onSelect={() => router.push("/privacy")}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Política de privacidad</span>
                      <span className="text-xs text-muted-foreground">
                        Cómo cuidamos tus datos y los de tus clientes.
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl p-2"
                  onSelect={() => router.push("/contact")}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <LifeBuoy className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Soporte y contacto</span>
                      <span className="text-xs text-muted-foreground">
                        Te ayudamos con dudas y configuración.
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <div className="px-2 pb-2 pt-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Comienza rápido
                  </p>
                </div>
                <DropdownMenuItem
                  className="rounded-xl p-2"
                  onSelect={() => router.push("/info")}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Cómo funciona</span>
                      <span className="text-xs text-muted-foreground">
                        Planes, beneficios y por qué te conviene.
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl p-2"
                  onSelect={() => router.push("/#stores")}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Store className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Explorar tiendas</span>
                      <span className="text-xs text-muted-foreground">
                        Mira marcas activas y ejemplos reales.
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl p-2"
                  onSelect={() => router.push("/login-admin")}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <LogIn className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Iniciar sesión</span>
                      <span className="text-xs text-muted-foreground">
                        Accede al panel de administración.
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl p-2"
                  onSelect={() => router.push("/contact")}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Habla con ventas</span>
                      <span className="text-xs text-muted-foreground">
                        Te orientamos con planes y migraciones.
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <ModeToggle />
            {!session ? (
              <Button
                variant="default"
                size="lg"
                className="group relative overflow-hidden rounded-full bg-banner-bg border-2 border-banner-border text-primary shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-xl hover:bg-primary group-hover:text-white focus-visible:ring-primary/50 animate-[pulse_2s_ease-in-out_infinite] hover:animate-none"
                onClick={() => router.push("/info")}
              >
                <span className="relative z-10 text-primary font-semibold group-hover:text">¿Quieres tener tu propio catálogo?</span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-white/0 via-white/35 to-white/0 opacity-70 transition-transform duration-700 group-hover:translate-x-full" />
                <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/25" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin")}
                >
                  Panel de administración
                </Button>
                <Button variant="destructive" onClick={() => setIsDialogOpen(true)}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:text-foreground"
                  aria-label="Abrir menú"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-background text-foreground border-border"
              >
                <VisuallyHidden>
                  <SheetTitle>Menú de navegación</SheetTitle>
                </VisuallyHidden>
                <div className="flex h-full flex-col gap-6 pt-12">
                  <div className="flex items-center gap-3 px-4">
                    <Image
                      src="/apple-icon.png"
                      alt="Logo"
                      width={40}
                      height={40}
                      className="rounded"
                    />
                    <div className="leading-tight">
                      <p className="text-sm font-semibold">Una Ganga - Catálogos</p>
                    </div>
                  </div>

                  <div className="px-4">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between border-b border-border py-3 text-left text-lg font-medium"
                      onClick={() => setMobileSolutionsOpen((prev) => !prev)}
                      aria-expanded={mobileSolutionsOpen}
                    >
                      Soluciones
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${mobileSolutionsOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                    {mobileSolutionsOpen && (
                      <div className="space-y-3 pt-4">
                        <button
                          type="button"
                          className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-left"
                          onClick={() => navigate("/info")}
                        >
                          <div className="flex items-center gap-3">
                            <Sparkles className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-semibold">Cómo funciona</p>
                              <p className="text-xs text-muted-foreground">
                                Planes, beneficios y herramientas.
                              </p>
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-left"
                          onClick={() => navigate("/#stores")}
                        >
                          <div className="flex items-center gap-3">
                            <Store className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-semibold">Explorar tiendas</p>
                              <p className="text-xs text-muted-foreground">
                                Marcas activas y ejemplos reales.
                              </p>
                            </div>
                          </div>
                        </button>
                        {session && (
                          <button
                            type="button"
                            className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-left"
                            onClick={() => navigate("/admin")}
                          >
                            <div className="flex items-center gap-3">
                              <LogIn className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-semibold">Panel de administración</p>
                                <p className="text-xs text-muted-foreground">
                                  Gestiona catálogos y productos.
                                </p>
                              </div>
                            </div>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="px-4">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between border-b border-border py-3 text-left text-lg font-medium"
                      onClick={() => setMobileResourcesOpen((prev) => !prev)}
                      aria-expanded={mobileResourcesOpen}
                    >
                      Recursos
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${mobileResourcesOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                    {mobileResourcesOpen && (
                      <div className="space-y-3 pt-4">
                        <button
                          type="button"
                          className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-left"
                          onClick={() => navigate("/terms")}
                        >
                          <div className="flex items-center gap-3">
                            <ScrollText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-semibold">Términos de uso</p>
                              <p className="text-xs text-muted-foreground">
                                Condiciones claras y transparentes.
                              </p>
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-left"
                          onClick={() => navigate("/privacy")}
                        >
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-semibold">Política de privacidad</p>
                              <p className="text-xs text-muted-foreground">
                                Protección de datos y seguridad.
                              </p>
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-left"
                          onClick={() => navigate("/contact")}
                        >
                          <div className="flex items-center gap-3">
                            <LifeBuoy className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-semibold">Soporte y contacto</p>
                              <p className="text-xs text-muted-foreground">
                                Asistencia personalizada y guía.
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="px-4">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between border-b border-border py-3 text-left text-lg font-medium"
                      onClick={() => navigate("/info")}
                    >
                      Pricing
                    </button>
                  </div>

                  <div className="px-4">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between border-b border-border py-3 text-left text-lg font-medium"
                      onClick={() => navigate("/contact")}
                    >
                      Enterprise
                    </button>
                  </div>

                  <div className="mt-auto space-y-3 px-4 pb-6">
                    {!session ? (
                      <>
                        <Button
                          variant="outline"
                          className="h-12 w-full rounded-full border-border bg-transparent text-foreground hover:bg-muted"
                          onClick={() => navigate("/login-admin")}
                        >
                          Iniciar sesión
                        </Button>
                        <Button
                          className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => navigate("/info")}
                        >
                          Comenzar gratis
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="h-12 w-full rounded-full border-border bg-transparent text-foreground hover:bg-muted"
                          onClick={() => navigate("/admin")}
                        >
                          Panel de administración
                        </Button>
                        <Button
                          className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={openLogoutDialog}
                        >
                          Cerrar sesión
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <LogoutDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleLogout}
      />
    </>
  );
}
