import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/db";
import type { StoreTheme } from "@/lib/theme";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ store: string }> }
) {
  const { store: storeSlug } = await params;

  const store = await prisma.store.findFirst({
    where: { slug: storeSlug, isActive: true },
  });

  if (!store) {
    return NextResponse.redirect(new URL("/default-favicon.png", request.url));
  }

  const storeTheme = (store.theme ?? null) as unknown as StoreTheme | null;
  const faviconUrl = storeTheme?.branding?.faviconUrl || storeTheme?.branding?.logoUrl;

  if (!faviconUrl) {
    return NextResponse.redirect(new URL("/default-favicon.png", request.url));
  }

  try {
    const response = await fetch(faviconUrl, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.redirect(new URL("/default-favicon.png", request.url));
    }

    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = new Uint8Array(arrayBuffer);

    const resizedBuffer = await sharp(imageBuffer).resize(32, 32).png().toBuffer();
    const resized = new Uint8Array(resizedBuffer);

    return new NextResponse(resized, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Error fetching favicon:", error);
    return NextResponse.redirect(new URL("/default-favicon.png", request.url));
  }
}
