import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface CreateCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    name: string;
    onNameChange: (name: string) => void;
    onConfirm: () => void;
    isLoading: boolean;
}

export function CreateCategoryDialog({
    open,
    onOpenChange,
    name,
    onNameChange,
    onConfirm,
    isLoading,
}: CreateCategoryDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Nueva Categoría</DialogTitle>
                    <DialogDescription>
                        Ingresa el nombre de la categoría. El slug se generará
                        automáticamente.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-category-name">Nombre</Label>
                        <Input
                            id="new-category-name"
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
                            placeholder="Ej: Electrónica"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={onConfirm} disabled={isLoading}>
                        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Crear Categoría
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface CreateSubcategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    name: string;
    onNameChange: (name: string) => void;
    onConfirm: () => void;
    isLoading: boolean;
    hasCategorySelected: boolean;
}

export function CreateSubcategoryDialog({
    open,
    onOpenChange,
    name,
    onNameChange,
    onConfirm,
    isLoading,
    hasCategorySelected,
}: CreateSubcategoryDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Nueva Subcategoría</DialogTitle>
                    <DialogDescription>
                        {hasCategorySelected
                            ? `Se creará una subcategoría para la categoría seleccionada.`
                            : "Por favor selecciona una categoría primero."}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-subcategory-name">Nombre</Label>
                        <Input
                            id="new-subcategory-name"
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
                            placeholder="Ej: Smartphones"
                            disabled={!hasCategorySelected}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading || !hasCategorySelected}
                    >
                        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Crear Subcategoría
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface CreateCurrencyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: {
        name: string;
        code: string;
        symbol: string;
    };
    onDataChange: (data: { name: string; code: string; symbol: string }) => void;
    onConfirm: () => void;
    isLoading: boolean;
}

export function CreateCurrencyDialog({
    open,
    onOpenChange,
    data,
    onDataChange,
    onConfirm,
    isLoading,
}: CreateCurrencyDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Nueva Moneda</DialogTitle>
                    <DialogDescription>
                        Ingresa los detalles de la moneda.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-currency-name">Nombre</Label>
                        <Input
                            id="new-currency-name"
                            value={data.name}
                            onChange={(e) => onDataChange({ ...data, name: e.target.value })}
                            placeholder="Ej: Dólar Estadounidense"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-currency-code">Código (ISO)</Label>
                        <Input
                            id="new-currency-code"
                            value={data.code}
                            onChange={(e) => onDataChange({ ...data, code: e.target.value })}
                            placeholder="Ej: USD"
                            maxLength={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-currency-symbol">Símbolo</Label>
                        <Input
                            id="new-currency-symbol"
                            value={data.symbol}
                            onChange={(e) =>
                                onDataChange({ ...data, symbol: e.target.value })
                            }
                            placeholder="Ej: $"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={onConfirm} disabled={isLoading}>
                        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Crear Moneda
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
