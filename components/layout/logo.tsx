"use client";
import Image from "next/image"
import { defaultStoreBranding } from "@/lib/theme"
import { useStoreBranding } from "@/components/theme/store-theme-provider"

interface LogoProps {
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
}

const Logo = ({ className, alt, width, height }: LogoProps) => {
  const branding = useStoreBranding()

  const src = branding.logoUrl ?? defaultStoreBranding.logoUrl
  const resolvedAlt = alt ?? branding.logoAlt ?? defaultStoreBranding.logoAlt
  const resolvedWidth = Math.min(width ?? branding.logoWidth ?? defaultStoreBranding.logoWidth ?? 100, 100)
  const resolvedHeight = Math.min(height ?? branding.logoHeight ?? defaultStoreBranding.logoHeight ?? 100, 100)

  return (
    <Image
      width={resolvedWidth}
      height={resolvedHeight}
      src={src || '/android-chrome-192x192.png'}
      alt={resolvedAlt || 'Logo'}
      className={className}
    />
  )
}

export default Logo