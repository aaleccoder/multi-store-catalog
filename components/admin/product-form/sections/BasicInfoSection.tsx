import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Editor } from "@/components/ui/editor";
import type { ProductFormData } from "../types";
import { generateSlug, sanitizeSlugInput } from "../utils";

interface BasicInfoSectionProps {
    formData: ProductFormData;
    onUpdate: (data: Partial<ProductFormData>) => void;
    manuallyEditedSlug: boolean;
    onSlugEditChange: (edited: boolean) => void;
}

export function BasicInfoSection({
    formData,
    onUpdate,
    manuallyEditedSlug,
    onSlugEditChange,
}: BasicInfoSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                            const name = e.target.value;
                            onUpdate({
                                name,
                                slug: manuallyEditedSlug ? formData.slug : generateSlug(name),
                            });
                        }}
                        required
                        aria-required={true}
                    />
                    <p className="text-xs text-muted-foreground">
                        Requerido — usado para listados de productos y SEO. Un buen nombre
                        ayuda a las conversiones.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                                onSlugEditChange(false);
                                onUpdate({ slug: generateSlug(formData.name) });
                            } else {
                                onSlugEditChange(true);
                                onUpdate({ slug: sanitizeSlugInput(value) });
                            }
                        }}
                        required
                        aria-required={true}
                    />
                    <p className="text-xs text-muted-foreground">
                        Requerido — slug único usado en URLs de productos, auto-generado
                        desde el nombre cuando está vacío.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="shortDescription">Descripción Corta</Label>
                    <Textarea
                        id="shortDescription"
                        value={formData.shortDescription}
                        onChange={(e) =>
                            onUpdate({ shortDescription: e.target.value.slice(0, 150) })
                        }
                        rows={2}
                        maxLength={150}
                    />
                    <p className="text-xs text-muted-foreground">
                        {formData.shortDescription?.length}/150 caracteres
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Descripción *</Label>
                    <Editor
                        value={formData.description}
                        onChange={(value) => onUpdate({ description: value })}
                        placeholder="Escribe una descripción detallada del producto..."
                    />
                    <p className="text-xs text-muted-foreground">
                        Requerido — una descripción completa ayuda a los clientes y motores
                        de búsqueda. Usa el editor de texto enriquecido para dar formato.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
