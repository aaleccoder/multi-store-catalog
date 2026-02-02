'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StoreTheme, ThemeKeys } from '@/lib/theme'
import { ColorField } from './color-field'
import { ShadowField } from './shadow-field'
import { colorKeySet, editableThemeKeys, shadowPresetKeys } from '../theme-constants'
import { getColorDescription, labelForKey } from '../theme-utils'

interface ThemeModeCardProps {
    mode: 'light' | 'dark'
    theme: StoreTheme
    mergedTheme: StoreTheme
    onChange: (mode: 'light' | 'dark', key: ThemeKeys, value: string) => void
    keys?: ThemeKeys[]
    title?: string
    description?: string
}

export const ThemeModeCard = ({
    mode,
    theme,
    mergedTheme,
    onChange,
    keys,
    title,
    description,
}: ThemeModeCardProps) => {
    const resolvedTitle = title ?? `Modo ${mode}`
    const resolvedDescription = description ?? `Valores aplicados a ${mode === 'light' ? 'modo claro' : 'modo oscuro'}.`
    const keysToShow = keys ?? editableThemeKeys

    return (
        <Card>
            <CardHeader>
                <CardTitle className="capitalize">{resolvedTitle}</CardTitle>
                <CardDescription>{resolvedDescription}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keysToShow.map((key) => {
                    const keyDescription = getColorDescription(key)
                    return (
                        <div key={`${mode}-${key}`} className="space-y-2">
                            <div>
                                <Label className="text-sm font-medium">{labelForKey(key)}</Label>
                                {keyDescription && (
                                    <p className="text-xs text-muted-foreground mt-1">{keyDescription}</p>
                                )}
                            </div>
                            {shadowPresetKeys.has(key) ? (
                                <ShadowField
                                    value={theme[mode]?.[key] ?? mergedTheme[mode][key]}
                                    onChange={(val) => onChange(mode, key, val)}
                                />
                            ) : colorKeySet.has(key) ? (
                                <ColorField
                                    value={theme[mode]?.[key] ?? mergedTheme[mode][key]}
                                    onChange={(val) => onChange(mode, key, val)}
                                />
                            ) : (
                                <Input
                                    value={theme[mode]?.[key] ?? mergedTheme[mode][key]}
                                    onChange={(e) => onChange(mode, key, e.target.value)}
                                    spellCheck={false}
                                />
                            )}
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
