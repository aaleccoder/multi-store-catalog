import { ThemeProvider } from "@/components/theme-provider";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" attribute="class" storageKey="next-theme">
      {children}
    </ThemeProvider>
  );
}
