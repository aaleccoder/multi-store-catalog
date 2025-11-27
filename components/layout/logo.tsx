import Image from "next/image"

interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => (
  <Image width={100} height={100} src="/android-chrome-192x192.png" alt="Lea Logo" className={className} />
)

export default Logo