import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Check,
    LifeBuoy,
    Palette,
    ScrollText,
    Shield,
    ShieldCheck,
    ShoppingCart,
    Store,
    Zap,
} from "lucide-react";

export default function InfoPage() {
    const plans = [
        {
            name: "Básico",
            price: "Gratis",
            description: "Perfecto para empezar",
            features: [
                "1 tienda activa",
                "Hasta 50 productos",
                "Tema básico personalizable",
                "Soporte por email",
            ],
            cta: "Comenzar gratis",
            highlighted: false,
        },
        {
            name: "Profesional",
            price: "$29/mes",
            description: "Para negocios en crecimiento",
            features: [
                "3 tiendas activas",
                "Productos ilimitados",
                "Temas completamente personalizables",
                "Carrito y Wishlist",
                "Análisis y reportes",
                "Soporte prioritario",
            ],
            cta: "Comenzar ahora",
            highlighted: true,
        },
        {
            name: "Empresarial",
            price: "$99/mes",
            description: "Para grandes operaciones",
            features: [
                "Tiendas ilimitadas",
                "Productos ilimitados",
                "Personalización total",
                "Dominio personalizado",
                "API completa",
                "Soporte 24/7",
                "Asesoría técnica",
            ],
            cta: "Contactar ventas",
            highlighted: false,
        },
    ];

    const features = [
        {
            icon: Store,
            title: "Múltiples tiendas",
            description: "Gestiona todos tus catálogos desde un solo lugar con facilidad.",
        },
        {
            icon: Palette,
            title: "Personalización total",
            description: "Cada tienda con su propio estilo, colores y marca única.",
        },
        {
            icon: ShoppingCart,
            title: "Experiencia de compra",
            description: "Carrito y lista de deseos integrados para tus clientes.",
        },
        {
            icon: BarChart,
            title: "Análisis y reportes",
            description: "Conoce el rendimiento de tus productos y tiendas.",
        },
        {
            icon: Shield,
            title: "Seguro y confiable",
            description: "Tu información y la de tus clientes siempre protegida.",
        },
        {
            icon: Zap,
            title: "Rápido y optimizado",
            description: "Carga instantánea y optimización automática de imágenes.",
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-linear-to-b from-primary/10 via-secondary/5 to-background pt-24 pb-16 lg:pt-32 lg:pb-24">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center space-y-6">
                        <div className="inline-block">
                            <Image
                                src="/android-chrome-192x192.png"
                                alt="Una Ganga Logo"
                                width={80}
                                height={80}
                                className="mx-auto"
                            />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                            Tu catálogo digital,{" "}
                            <span className="text-primary">listo en minutos</span>
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                            Crea y gestiona catálogos profesionales para tus tiendas. Sin complicaciones,
                            sin costos ocultos. Todo lo que necesitas en una sola plataforma.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            <Button asChild size="lg">
                                <Link href="/login-admin">Comenzar ahora</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/#stores">Ver tiendas activas</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center space-y-4 mb-12">
                        <h2 className="text-3xl font-bold sm:text-4xl">
                            Todo lo que necesitas para vender online
                        </h2>
                        <p className="mx-auto max-w-2xl text-muted-foreground">
                            Herramientas poderosas y fáciles de usar para llevar tu negocio al siguiente nivel
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
                                    <CardHeader>
                                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <CardTitle>{feature.title}</CardTitle>
                                        <CardDescription>{feature.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-16 lg:py-24 bg-muted/30">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center space-y-4 mb-12">
                        <h2 className="text-3xl font-bold sm:text-4xl">
                            Planes que se adaptan a ti
                        </h2>
                        <p className="mx-auto max-w-2xl text-muted-foreground">
                            Comienza gratis y escala cuando lo necesites
                        </p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {plans.map((plan, index) => (
                            <Card
                                key={index}
                                className={`relative ${plan.highlighted
                                    ? "border-primary shadow-lg scale-105"
                                    : "border-border/50"
                                    }`}
                            >
                                {plan.highlighted && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="inline-block rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                                            Más popular
                                        </span>
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                    <div className="pt-4">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-start gap-3">
                                                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        asChild
                                        className="w-full"
                                        variant={plan.highlighted ? "default" : "outline"}
                                    >
                                        <Link href="/login-admin">{plan.cta}</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Legal & Support Section */}
            <section className="py-16 lg:py-24 bg-background">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center space-y-4 mb-12">
                        <h2 className="text-3xl font-bold sm:text-4xl">
                            Legal y soporte
                        </h2>
                        <p className="mx-auto max-w-2xl text-muted-foreground">
                            Transparencia total y ayuda rápida cuando la necesites.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        <Card id="terms" className="scroll-mt-24 border-border/50">
                            <CardHeader>
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <ScrollText className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>Términos de uso</CardTitle>
                                <CardDescription>
                                    Reglas claras para operar con seguridad y confianza.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        <Card id="privacy" className="scroll-mt-24 border-border/50">
                            <CardHeader>
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <ShieldCheck className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>Política de privacidad</CardTitle>
                                <CardDescription>
                                    Tu información protegida con prácticas modernas y transparentes.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        <Card id="support" className="scroll-mt-24 border-border/50">
                            <CardHeader>
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <LifeBuoy className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>Soporte y contacto</CardTitle>
                                <CardDescription>
                                    Nuestro equipo te acompaña en la configuración y el crecimiento.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 lg:py-24">
                <div className="mx-auto max-w-4xl px-6">
                    <Card className="border-primary/50 bg-linear-to-br from-primary/5 to-secondary/5">
                        <CardContent className="p-8 lg:p-12 text-center space-y-6">
                            <h2 className="text-3xl font-bold sm:text-4xl">
                                ¿Listo para comenzar?
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Únete a cientos de negocios que ya están vendiendo online con Una Ganga
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 pt-4">
                                <Button asChild size="lg">
                                    <Link href="/login-admin">Crear mi catálogo gratis</Link>
                                </Button>
                                <Button asChild variant="outline" size="lg">
                                    <Link href="/">Ver demo</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
