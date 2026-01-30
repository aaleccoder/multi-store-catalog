"use client";

import React from "react";
import {
  mergeTheme,
  themeToCssVars,
  StoreTheme,
  defaultStoreBranding,
} from "@/lib/theme";
import { resolveStoreFontClassName } from "@/lib/store-fonts";

const StoreBrandingContext = React.createContext(defaultStoreBranding);

export const useStoreBranding = () => React.useContext(StoreBrandingContext);

interface StoreThemeProviderProps {
  theme?: StoreTheme;
  children: React.ReactNode;
}

export function StoreThemeProvider({
  theme,
  children,
}: StoreThemeProviderProps) {
  const merged = mergeTheme(theme);
  const branding = merged.branding ?? defaultStoreBranding;
  const fontClassName = resolveStoreFontClassName(merged.fontId);
  const css = themeToCssVars(merged);

  return (
    <StoreBrandingContext.Provider value={branding}>
      <div className={fontClassName}>
        <style id="store-theme" dangerouslySetInnerHTML={{ __html: css }} />
        {children}
      </div>
    </StoreBrandingContext.Provider>
  );
}
