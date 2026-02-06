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


  const src = branding.logoUrl ?? defaultStoreBranding.logoUrl;
  const resolvedAlt = alt ?? branding.logoAlt ?? defaultStoreBranding.logoAlt;

  return (
    <>
      {src ? (
        <Image
          width={width ?? 64}
          height={height ?? 64}
          src={src}
          alt={resolvedAlt ?? "Logo"}
          className={className}
        />
      ) : (
        <div className={`${className} flex items-center justify-center bg-muted text-muted-foreground rounded-md p-4`}>
          <p>Logo</p>
        </div>
      )}
    </>
  );
};

export default Logo;
