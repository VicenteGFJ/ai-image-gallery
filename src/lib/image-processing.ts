import sharp from 'sharp'
import { THUMBNAIL_SIZE } from './constants'

export async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 80 })
    .toBuffer()
}

export async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata()
  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  }
}
