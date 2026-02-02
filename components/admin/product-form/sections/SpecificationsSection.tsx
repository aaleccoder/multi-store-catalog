import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ProductFormData } from "../types";

interface SpecificationsSectionProps {
    formData: ProductFormData;
    onUpdate: (data: Partial<ProductFormData>) => void;
}

export function SpecificationsSection({
    formData,
    onUpdate,
}: SpecificationsSectionProps) {
    const updateSpecification = (updates: any) => {
        onUpdate({
            specifications: {
                ...(formData.specifications || {}),
                ...updates,
            },
        });
    };

    const updateDimension = (field: string, value: any) => {
        onUpdate({
            specifications: {
                ...(formData.specifications || {}),
                dimensions: {
                    ...(formData.specifications?.dimensions || {}),
                    [field]: value,
                },
            },
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Especificaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                        id="sku"
                        value={(formData.specifications || {}).sku || ""}
                        onChange={(e) => updateSpecification({ sku: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="unit">Unidad</Label>
                    <Input
                        id="unit"
                        placeholder="ej. 6 unidades, 1 paquete"
                        value={(formData.specifications || {}).unit || ""}
                        onChange={(e) => updateSpecification({ unit: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                        Opcional - cantidad que trae el producto (ej. 6 unidades)
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="weight">Peso</Label>
                        <Input
                            id="weight"
                            type="number"
                            step="0.01"
                            min="0"
                            value={(formData.specifications || {}).weight || ""}
                            onChange={(e) =>
                                updateSpecification({
                                    weight: e.target.value
                                        ? Math.max(0, parseFloat(e.target.value))
                                        : undefined,
                                })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Unidad de Peso</Label>
                        <Select
                            value={(formData.specifications || {}).weightUnit || "g"}
                            onValueChange={(value) =>
                                updateSpecification({ weightUnit: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="g">g</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="lbs">lbs</SelectItem>
                                <SelectItem value="oz">oz</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="volume">Volumen</Label>
                        <Input
                            id="volume"
                            type="number"
                            step="0.01"
                            min="0"
                            value={(formData.specifications || {}).volume || ""}
                            onChange={(e) => {
                                const value = e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined;
                                updateSpecification({
                                    volume:
                                        value !== undefined && value < 0 ? undefined : value,
                                });
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Unidad de Volumen</Label>
                        <Select
                            value={(formData.specifications || {}).volumeUnit || "ml"}
                            onValueChange={(value) =>
                                updateSpecification({ volumeUnit: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ml">ml</SelectItem>
                                <SelectItem value="l">l</SelectItem>
                                <SelectItem value="fl oz">fl oz</SelectItem>
                                <SelectItem value="gal">gal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Dimensiones</Label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="length">Largo</Label>
                            <Input
                                id="length"
                                type="number"
                                step="0.01"
                                min="0"
                                value={
                                    (formData.specifications || {}).dimensions?.length || ""
                                }
                                onChange={(e) => {
                                    const value = e.target.value
                                        ? parseFloat(e.target.value)
                                        : undefined;
                                    updateDimension(
                                        "length",
                                        value !== undefined && value < 0 ? undefined : value
                                    );
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="width">Ancho</Label>
                            <Input
                                id="width"
                                type="number"
                                step="0.01"
                                min="0"
                                value={(formData.specifications || {}).dimensions?.width || ""}
                                onChange={(e) => {
                                    const value = e.target.value
                                        ? parseFloat(e.target.value)
                                        : undefined;
                                    updateDimension(
                                        "width",
                                        value !== undefined && value < 0 ? undefined : value
                                    );
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="height">Alto</Label>
                            <Input
                                id="height"
                                type="number"
                                step="0.01"
                                min="0"
                                value={
                                    (formData.specifications || {}).dimensions?.height || ""
                                }
                                onChange={(e) => {
                                    const value = e.target.value
                                        ? parseFloat(e.target.value)
                                        : undefined;
                                    updateDimension(
                                        "height",
                                        value !== undefined && value < 0 ? undefined : value
                                    );
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Unidad</Label>
                            <Select
                                value={(formData.specifications || {}).dimensions?.unit || "cm"}
                                onValueChange={(value) => updateDimension("unit", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mm">mm</SelectItem>
                                    <SelectItem value="cm">cm</SelectItem>
                                    <SelectItem value="m">m</SelectItem>
                                    <SelectItem value="in">in</SelectItem>
                                    <SelectItem value="ft">ft</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
