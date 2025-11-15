'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Media {
  url?: string | null
  alt?: string
}

interface ImageData {
  image: number | Media
  alt?: string
  isPrimary?: boolean | null
  id?: string | null
}

interface ImageGalleryProps {
  images: ImageData[]
  productName: string
  primaryImageUrl: string
  primaryImageAlt: string
}

export function ImageGallery({
  images,
  productName,
  primaryImageUrl,
  primaryImageAlt,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Get the URL for the currently selected image
  const selectedImage = images[selectedIndex]
  const selectedImageData = selectedImage?.image
  const selectedImageUrl =
    typeof selectedImageData === 'object' && selectedImageData !== null
      ? selectedImageData.url || primaryImageUrl
      : primaryImageUrl
  const selectedImageAltText = selectedImage?.alt || primaryImageAlt

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative aspect-square bg-muted/30 overflow-hidden rounded-lg">
        {selectedImageUrl ? (
          <Image
            src={selectedImageUrl}
            alt={selectedImageAltText}
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">Sin imagen</span>
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((img: ImageData, idx: number) => {
            const thumbImage = img.image
            const imgUrl =
              typeof thumbImage === 'object' && thumbImage !== null ? thumbImage.url || '' : ''
            const isSelected = idx === selectedIndex

            return (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={cn(
                  'relative aspect-square bg-muted/30 overflow-hidden rounded-md transition-all',
                  'border-2 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  isSelected ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border',
                )}
                aria-label={`Ver imagen ${idx + 1}`}
                aria-pressed={isSelected}
              >
                {imgUrl && (
                  <Image
                    src={imgUrl}
                    alt={img.alt || `${productName} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 150px"
                  />
                )}
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
