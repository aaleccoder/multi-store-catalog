'use client'

import React, { useState, useMemo } from 'react'
import * as Icons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Search, X } from 'lucide-react'

interface IconPickerProps {
    value?: string
    onChange: (iconName: string | undefined) => void
    label?: string
}

export function IconPicker({ value, onChange, label = 'Icon' }: IconPickerProps) {
    const [search, setSearch] = useState('')
    const [open, setOpen] = useState(false)

    // Get all lucide icon names
    const iconNames = useMemo(() => {
        return Object.keys(Icons)
            .filter(
                (key) =>
                    typeof Icons[key as keyof typeof Icons] === 'function' &&
                    key !== 'createLucideIcon' &&
                    key !== 'default'
            )
            .sort()
    }, [])

    // Filter icons based on search
    const filteredIcons = useMemo(() => {
        if (!search) return iconNames
        return iconNames.filter((name) =>
            name.toLowerCase().includes(search.toLowerCase())
        )
    }, [iconNames, search])

    // Get the selected icon component
    const SelectedIcon = value ? (Icons[value as keyof typeof Icons] as React.ComponentType<any>) : null

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-10 justify-start items-center gap-2 flex-1"
                        >
                            {SelectedIcon ? (
                                <>
                                    <SelectedIcon className="h-4 w-4" />
                                    <span>{value}</span>
                                </>
                            ) : (
                                <span className="text-muted-foreground">Select icon...</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                        <div className="p-3 border-b">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search icons..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto p-2">
                            {filteredIcons.length === 0 ? (
                                <div className="text-center py-6 text-sm text-muted-foreground">
                                    No icons found
                                </div>
                            ) : (
                                <div className="grid grid-cols-6 gap-1">
                                    {filteredIcons.map((iconName) => {
                                        const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>
                                        return (
                                            <button
                                                key={iconName}
                                                onClick={() => {
                                                    onChange(iconName)
                                                    setOpen(false)
                                                    setSearch('')
                                                }}
                                                className={`p-2 rounded hover:bg-accent flex items-center justify-center group relative ${value === iconName ? 'bg-accent' : ''
                                                    }`}
                                                title={iconName}
                                                type="button"
                                            >
                                                <IconComponent className="h-5 w-5" />
                                                <span className="absolute bottom-full mb-1 hidden group-hover:block bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md whitespace-nowrap z-50">
                                                    {iconName}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
                {value && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onChange(undefined)}
                        className="h-10 w-10"
                        type="button"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
