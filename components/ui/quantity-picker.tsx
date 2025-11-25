"use client"

import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface QuantityPickerProps {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    className?: string
    disabled?: boolean
    size?: "default" | "sm"
}

export function QuantityPicker({
    value,
    onChange,
    min = 1,
    max = 100,
    step = 1,
    className,
    disabled = false,
    size = "default",
}: QuantityPickerProps) {
    const [inputValue, setInputValue] = React.useState(value.toString())

    React.useEffect(() => {
        setInputValue(value.toString())
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)
        const parsedValue = parseFloat(newValue)

        if (!isNaN(parsedValue) && parsedValue >= min) {
            if (max === undefined || parsedValue <= max) {
                onChange(parsedValue)
            }
        }
    }

    const handleBlur = () => {
        const parsedValue = parseFloat(inputValue)
        if (isNaN(parsedValue) || parsedValue < min) {
            setInputValue(value.toString())
            onChange(value)
        } else if (max !== undefined && parsedValue > max) {
            setInputValue(max.toString())
            onChange(max)
        } else {
            setInputValue(parsedValue.toString())
            onChange(parsedValue)
        }
    }

    const handleIncrement = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const newValue = value + step
        if (max === undefined || newValue <= max) {
            onChange(newValue)
        }
    }

    const handleDecrement = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const newValue = value - step
        if (newValue >= min) {
            onChange(newValue)
        }
    }

    const heightClass = size === "sm" ? "h-7" : "h-10"
    const buttonWidthClass = size === "sm" ? "w-8" : "w-10"
    const iconSizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
    const textSizeClass = size === "sm" ? "text-sm" : "text-base"

    return (
        <div className={cn("flex items-center rounded-md border border-input bg-background text-primary", className)}>
            <Button
                variant="ghost"
                size="icon"
                className={cn(heightClass, buttonWidthClass, "shrink-0 rounded-none hover:bg-accent hover:text-accent-foreground")}
                onClick={handleDecrement}
                disabled={disabled || value <= min}
            >
                <Minus className={iconSizeClass} />
                <span className="sr-only">Decrease</span>
            </Button>
            <div className={cn("flex-1 border-x border-input min-w-[2rem]", heightClass)}>
                <Input
                    type="number"
                    className={cn(
                        "h-full w-full border-0 bg-background text-center focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none",
                        textSizeClass,
                        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    )}
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    min={min}
                    max={max}
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                />
            </div>
            <Button
                variant="ghost"
                size="icon"
                className={cn(heightClass, buttonWidthClass, "shrink-0 rounded-none hover:bg-accent hover:text-accent-foreground")}
                onClick={handleIncrement}
                disabled={disabled || (max !== undefined && value >= max)}
            >
                <Plus className={iconSizeClass} />
                <span className="sr-only">Increase</span>
            </Button>
        </div>
    )
}
