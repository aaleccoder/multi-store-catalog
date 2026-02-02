import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ProductFormData } from "../types";

interface StatusSectionProps {
    formData: ProductFormData;
    onUpdate: (data: Partial<ProductFormData>) => void;
}

export function StatusSection({ formData, onUpdate }: StatusSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => onUpdate({ isActive: checked })}
                    />
                    <Label htmlFor="isActive">Activo</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="inStock"
                        checked={formData.inStock}
                        onCheckedChange={(checked) => onUpdate({ inStock: checked })}
                    />
                    <Label htmlFor="inStock">En Stock</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => onUpdate({ featured: checked })}
                    />
                    <Label htmlFor="featured">Destacado</Label>
                </div>
            </CardContent>
        </Card>
    );
}
