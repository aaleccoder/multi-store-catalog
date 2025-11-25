import { Icon, IconName } from '@/components/ui/icon-picker'
import { dynamicIconImports } from 'lucide-react/dynamic'
import { Package } from 'lucide-react'

interface CategoryIconProps {
    icon?: string | null
    className?: string
}

export const CategoryIcon = ({ icon, className }: CategoryIconProps) => {
    if (!icon || !icon.trim()) {
        return <Package className={className} />
    }

    const trimmedIcon = icon.trim()

    if (trimmedIcon.startsWith('<svg') || trimmedIcon.startsWith('<?xml')) {
        return (
            <div
                className={className}
                dangerouslySetInnerHTML={{ __html: trimmedIcon }}
            />
        )
    }

    if (!(trimmedIcon in dynamicIconImports)) {
        console.warn(`Icon name "${trimmedIcon}" not found in Lucide library, using fallback`)
        return <Package className={className} />
    }

    return <Icon name={trimmedIcon as IconName} className={className} />
}
