import * as Minio from 'minio'

// Initialize MinIO client
export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
})

export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'catalog-images'

// Initialize bucket if it doesn't exist
export async function ensureBucketExists() {
    try {
        const exists = await minioClient.bucketExists(BUCKET_NAME)
        if (!exists) {
            await minioClient.makeBucket(BUCKET_NAME, 'us-east-1')

            // Set bucket policy to allow public read access
            const policy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: { AWS: ['*'] },
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
                    },
                ],
            }
            await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy))
        }
    } catch (error) {
        console.error('Error ensuring bucket exists:', error)
    }
}

// Upload file to MinIO
export async function uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string,
): Promise<string> {
    await ensureBucketExists()

    const objectName = `${Date.now()}-${fileName}`

    await minioClient.putObject(BUCKET_NAME, objectName, file, file.length, {
        'Content-Type': contentType,
    })

    // Generate public URL
    const url = `${process.env.MINIO_PUBLIC_URL || `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`}/${BUCKET_NAME}/${objectName}`

    return url
}

// Delete file from MinIO
export async function deleteFile(fileName: string): Promise<void> {
    try {
        await minioClient.removeObject(BUCKET_NAME, fileName)
    } catch (error) {
        console.error('Error deleting file:', error)
    }
}

// Get file URL
export function getFileUrl(fileName: string): string {
    return `${process.env.MINIO_PUBLIC_URL || `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`}/${BUCKET_NAME}/${fileName}`
}
