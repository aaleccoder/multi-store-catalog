import type { Metadata } from "next";
import Providers from "./providers";
import "@/app/globals.css";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Una Ganga",
};

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={outfit.variable}>
      <body suppressHydrationWarning>
        <ThemeProvider defaultTheme="system" attribute="class" storageKey="next-theme">

          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html >
  );
}
