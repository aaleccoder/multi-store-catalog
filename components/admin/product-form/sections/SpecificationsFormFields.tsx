import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Specifications } from "../types";

interface SpecificationsFormFieldsProps {
    specifications: Specifications;
    onUpdate: (updates: Partial<Specifications>) => void;
}

export function SpecificationsFormFields({
    specifications,
    onUpdate,
}: SpecificationsFormFieldsProps) {
    const updateDimension = (field: string, value: any) => {
        onUpdate({
            dimensions: {
                ...(specifications?.dimensions || {}),
                [field]: value,
            },
        });
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
                <Label>Unidad</Label>
                <Input
                    placeholder="ej. 6 unidades, 1 paquete"
                    value={(specifications || {}).unit || ""}
                    onChange={(e) => onUpdate({ unit: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Peso</Label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={(specifications || {}).weight || ""}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            const newWeight =
                                rawValue === ""
                                    ? undefined
                                    : (() => {
                                        const val = parseFloat(rawValue);
                                        return isNaN(val) || val < 0 ? undefined : val;
                                    })();
                            onUpdate({ weight: newWeight });
                        }}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Unidad</Label>
                    <Select
                        value={(specifications || {}).weightUnit || "g"}
                        onValueChange={(value) => onUpdate({ weightUnit: value })}
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Volumen</Label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={(specifications || {}).volume || ""}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            const newVolume =
                                rawValue === ""
                                    ? undefined
                                    : (() => {
                                        const val = parseFloat(rawValue);
                                        return isNaN(val) || val < 0 ? undefined : val;
                                    })();
                            onUpdate({ volume: newVolume });
                        }}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Unidad</Label>
                    <Select
                        value={(specifications || {}).volumeUnit || "ml"}
                        onValueChange={(value) => onUpdate({ volumeUnit: value })}
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
                <Label>Dimensiones (Largo x Ancho x Alto)</Label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Largo"
                        value={(specifications?.dimensions || {}).length || ""}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            const newLength =
                                rawValue === ""
                                    ? undefined
                                    : (() => {
                                        const val = parseFloat(rawValue);
                                        return isNaN(val) || val < 0 ? undefined : val;
                                    })();
                            updateDimension("length", newLength);
                        }}
                    />
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ancho"
                        value={(specifications?.dimensions || {}).width || ""}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            const newWidth =
                                rawValue === ""
                                    ? undefined
                                    : (() => {
                                        const val = parseFloat(rawValue);
                                        return isNaN(val) || val < 0 ? undefined : val;
                                    })();
                            updateDimension("width", newWidth);
                        }}
                    />
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Alto"
                        value={(specifications?.dimensions || {}).height || ""}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            const newHeight =
                                rawValue === ""
                                    ? undefined
                                    : (() => {
                                        const val = parseFloat(rawValue);
                                        return isNaN(val) || val < 0 ? undefined : val;
                                    })();
                            updateDimension("height", newHeight);
                        }}
                    />
                    <Select
                        value={(specifications?.dimensions || {}).unit || "cm"}
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
    );
}
