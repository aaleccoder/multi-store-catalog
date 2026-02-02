import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { ProductFormData, PriceInput } from "../types";
import type { Currency } from "@/lib/currency-client";
import { createNumberInputHandlers } from "@/lib/number-input";

interface PricingSectionProps {
    formData: ProductFormData;
    onUpdate: (data: Partial<ProductFormData>) => void;
    currencies: Currency[];
    loading: boolean;
    onCreateCurrency: () => void;
}

export function PricingSection({
    formData,
    onUpdate,
    currencies,
    loading,
    onCreateCurrency,
}: PricingSectionProps) {
    const getCurrencySymbol = (code: string) =>
        currencies.find((c) => c.code === code)?.symbol ?? "";

    const getDiscountDetails = (price: number, salePrice?: number) => {
        if (!salePrice || salePrice <= 0 || salePrice >= price) {
            return null;
        }
        const amount = price - salePrice;
        const percent = Math.round((amount / price) * 100);
        return { amount, percent };
    };

    const handlePriceChange = (index: number, updates: Partial<PriceInput>) => {
        const newPrices = [...(formData.prices || [])];
        newPrices[index] = { ...newPrices[index], ...updates };
        onUpdate({ prices: newPrices });
    };

    const handleAddPrice = () => {
        const defaultCurrency = currencies[0]?.code || "USD";
        const newPrices = [
            ...(formData.prices || []),
            {
                price: 0,
                salePrice: undefined,
                currency: defaultCurrency,
                isDefault: (formData.prices?.length ?? 0) === 0,
                taxIncluded: true,
            },
        ];
        onUpdate({ prices: newPrices });
    };

    const handleRemovePrice = (index: number) => {
        const newPrices = (formData.prices || []).filter((_, i) => i !== index);
        if (newPrices.length === 1) {
            newPrices[0] = { ...newPrices[0], isDefault: true };
        }
        onUpdate({ prices: newPrices });
    };

    const handleSetDefault = (index: number) => {
        const newPrices = (formData.prices || []).map((x, i) => ({
            ...x,
            isDefault: i === index,
        }));
        onUpdate({ prices: newPrices });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Precios (múltiples monedas)</CardTitle>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onCreateCurrency}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Nueva Moneda
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Agrega precios para todas las monedas que soportas. Un precio debe
                    marcarse como predeterminado para la moneda principal.
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {(formData.prices ?? []).map((p, idx) => (
                    <div
                        key={idx}
                        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-start p-4 rounded-lg border ${p.isDefault ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                        <div className="space-y-2 min-w-0">
                            <Label className="h-5">Moneda</Label>
                            <Select
                                value={p.currency || currencies[0]?.code || "USD"}
                                onValueChange={(value) =>
                                    handlePriceChange(idx, { currency: value })
                                }
                                aria-busy={loading}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar moneda" />
                                </SelectTrigger>
                                <SelectContent>
                                    {loading ? (
                                        <div className="px-4 py-2 flex items-center justify-center text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Cargando monedas...
                                        </div>
                                    ) : currencies.length === 0 ? (
                                        <div className="px-4 py-2 text-sm text-muted-foreground">
                                            No hay monedas disponibles. Crea una nueva moneda.
                                        </div>
                                    ) : (
                                        currencies.map((c) => (
                                            <SelectItem key={c.id} value={c.code}>
                                                <span className="truncate">
                                                    {c.symbol} {c.code} - {c.name}
                                                </span>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="h-5">Precio</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={p.price || ""}
                                {...createNumberInputHandlers({
                                    onChange: (value) => {
                                        handlePriceChange(idx, {
                                            price: value === "" ? 0 : (value as number),
                                        });
                                    },
                                    defaultValue: 0,
                                    parseType: "float",
                                })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="h-5">Precio de Venta</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={p.salePrice ?? ""}
                                {...createNumberInputHandlers({
                                    onChange: (value) => {
                                        handlePriceChange(idx, {
                                            salePrice:
                                                value === "" ? undefined : (value as unknown as number),
                                        });
                                    },
                                    defaultValue: null,
                                    parseType: "float",
                                })}
                            />
                            <div className="min-h-[1.25rem]">
                                {p.price > 0 && p.salePrice ? (
                                    (() => {
                                        const discount = getDiscountDetails(p.price, p.salePrice);
                                        if (!discount) {
                                            return null;
                                        }
                                        const currencySymbol = getCurrencySymbol(
                                            p.currency || currencies[0]?.code || "USD"
                                        );
                                        return (
                                            <p className="text-xs text-emerald-600">
                                                Descuento: {discount.percent}% (
                                                {currencySymbol}
                                                {discount.amount.toFixed(2)})
                                            </p>
                                        );
                                    })()
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-2 hidden">
                            <Label>Impuesto Incluido</Label>
                        </div>

                        <div className="space-y-2">
                            <Label className="h-5">Predeterminado</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={p.isDefault ? "default" : "outline"}
                                    disabled={p.isDefault}
                                    onClick={() => handleSetDefault(idx)}
                                >
                                    {p.isDefault ? "Predeterminado" : "Establecer"}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRemovePrice(idx)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                <div>
                    <Button type="button" onClick={handleAddPrice}>
                        <Plus className="h-4 w-4 mr-2" /> Agregar Precio
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                        Consejo: Agrega precios localizados para cada moneda que soportas.
                        Marca uno como predeterminado. Puedes agregar más de uno por moneda
                        para diferentes puntos de precio.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
