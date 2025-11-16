import { NextResponse } from "next/server";
import { Readable } from "stream";
import type { Readable as NodeReadable } from "stream";
import { minioClient, BUCKET_NAME, ensureBucketExists } from "@/lib/minio";

// Ensure the bucket exists when the module loads
await ensureBucketExists().catch(console.error);

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    console.log(BUCKET_NAME);

    if (!id) {
        return NextResponse.json(
            { error: 'Media ID is required' },
            { status: 400 }
        );
    }

    try {
        const stat = await minioClient.statObject(BUCKET_NAME, id);
        const stream = await minioClient.getObject(BUCKET_NAME, id) as unknown as NodeReadable;

        const webStream = Readable.toWeb(stream);

        return new Response(webStream as any, {
            headers: {
                "Content-Type": stat.metaData["content-type"] ?? "image/jpeg",
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
}
