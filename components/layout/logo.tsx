"use client";
import Image from "next/image";
import { defaultStoreBranding } from "@/lib/theme";
import { useStoreBranding } from "@/components/theme/store-theme-provider";

interface LogoProps {
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
}

const Logo = ({ className, alt, width, height }: LogoProps) => {
  const branding = useStoreBranding();


  console.log(branding);

  const src = branding.logoUrl ?? defaultStoreBranding.logoUrl;
  const resolvedAlt = alt ?? branding.logoAlt ?? defaultStoreBranding.logoAlt;

  return (
    <Image
      width={width ?? 64}
      height={height ?? 64}
      src={src || "/android-chrome-192x192.png"}
      alt={resolvedAlt || "Logo"}
      className={className}
    />
  );
};

export default Logo;
