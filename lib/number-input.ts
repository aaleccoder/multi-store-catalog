import type { ChangeEvent, FocusEvent } from "react";

type NumberInputHandlers = {
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: FocusEvent<HTMLInputElement>) => void;
};

/**
 * Creates onChange and onBlur handlers for number inputs that:
 * - Allow users to freely delete all characters during typing (including "0")
 * - Only validate and enforce constraints when the input loses focus (onBlur)
 * - Support both integer and float parsing
 * - Enforce minimum values (defaults to 0)
 *
 * @example
 * const handlers = createNumberInputHandlers({
 *   onChange: (value) => updateVariant(idx, { stock: value }),
 *   defaultValue: 0,
 *   parseType: 'int',
 * });
 *
 * <Input type="number" value={variant.stock} {...handlers} />
 */
export function createNumberInputHandlers<T extends number | null>({
    onChange,
    defaultValue,
    parseType = "float",
    min = 0,
}: {
    /** Callback to update the value in parent state */
    onChange: (value: T | (string & {})) => void;
    /** Default value to use when input is empty or invalid */
    defaultValue: T;
    /** Whether to parse as integer or float */
    parseType?: "int" | "float";
    /** Minimum allowed value (defaults to 0) */
    min?: number;
}): NumberInputHandlers {
    const parse = parseType === "int" ? parseInt : parseFloat;

    return {
        onChange: (e) => {
            const value = e.target.value;
            if (value === "") {
                // Allow temporary empty string for better UX while typing
                onChange("" as any);
            } else {
                const parsed = parse(value, 10);
                onChange((isNaN(parsed) ? defaultValue : parsed) as T);
            }
        },
        onBlur: (e) => {
            // Validate and enforce constraints when losing focus
            const value =
                e.target.value === "" ? defaultValue : parse(e.target.value, 10);

            if (defaultValue === null) {
                // For nullable fields (like salePrice)
                const validated = isNaN(value as number) || (value as number) < min ? defaultValue : value;
                onChange(validated as T);
            } else {
                // For non-nullable fields
                const validated = isNaN(value as number) || (value as number) < min ? defaultValue : value;
                onChange(validated as T);
            }
        },
    };
}