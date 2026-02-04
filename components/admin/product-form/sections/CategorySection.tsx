import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import type { ProductFormData, Category, Subcategory } from "../types";

interface CategorySectionProps {
    formData: ProductFormData;
    onUpdate: (data: Partial<ProductFormData>) => void;
    categories: Category[];
    subcategories: Subcategory[];
    loading: boolean;
    onCreateCategory: () => void;
    onCreateSubcategory: () => void;
}

export function CategorySection({
    formData,
    onUpdate,
    categories,
    subcategories,
    loading,
    onCreateCategory,
    onCreateSubcategory,
}: CategorySectionProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Categoría</CardTitle>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onCreateCategory}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Nueva Categoría
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                        <p className="text-xs text-muted-foreground">
                            Opcional - esto ayuda a los clientes a encontrar tu producto.
                        </p>
                        <Select
                            key={`category-${formData.categoryId ?? "none"}`}
                            value={formData.categoryId ?? "none"}
                            onValueChange={(value) =>
                                onUpdate({
                                    categoryId: value === "none" ? null : value,
                                    subcategoryId: null,
                                })
                            }
                            aria-busy={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar categoría (opcional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Sin categoría</SelectItem>
                                {loading ? (
                                    <div className="px-4 py-2 flex items-center justify-center text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Cargando categorías...
                                    </div>
                                ) : categories.length === 0 ? (
                                    <div className="px-4 py-2 text-sm text-muted-foreground">
                                        No hay categorías. Crea una nueva.
                                    </div>
                                ) : (
                                    categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="subcategory">Subcategoría</Label>
                            {formData.categoryId && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={onCreateSubcategory}
                                    className="h-auto py-1 px-2"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Nueva
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Opcional - elige una categoría más específica si aplica.
                        </p>
                        <Select
                            key={`subcategory-${formData.categoryId ?? "none"}-${formData.subcategoryId ?? "none"}`}
                            value={formData.subcategoryId ?? "none"}
                            onValueChange={(value) =>
                                onUpdate({
                                    subcategoryId: value === "none" ? null : value,
                                })
                            }
                            disabled={!formData.categoryId}
                            aria-busy={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar subcategoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Ninguna</SelectItem>
                                {loading ? (
                                    <div className="px-4 py-2 flex items-center justify-center text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Cargando subcategorías...
                                    </div>
                                ) : (
                                    subcategories.map((sub) => (
                                        <SelectItem key={sub.id} value={sub.id}>
                                            {sub.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
