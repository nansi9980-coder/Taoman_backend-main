import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private configured = false;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
      this.configured = true;
    } else {
      this.logger.warn('Cloudinary non configuré — uploads locaux utilisés en secours.');
    }
  }

  isConfigured(): boolean {
    return this.configured;
  }

  private uploadBuffer(
    buffer: Buffer,
    options: Record<string, unknown>,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) reject(error);
        else if (!result) reject(new Error('Upload Cloudinary sans résultat'));
        else resolve(result);
      });
      Readable.from(buffer).pipe(uploadStream);
    });
  }

  async uploadImage(buffer: Buffer, folder = 'taoman/media'): Promise<UploadApiResponse> {
    return this.uploadBuffer(buffer, { folder, resource_type: 'auto' });
  }

  async uploadRaw(buffer: Buffer, publicId: string, folder = 'taoman/backups'): Promise<UploadApiResponse> {
    return this.uploadBuffer(buffer, {
      folder,
      resource_type: 'raw',
      public_id: publicId,
      overwrite: true,
    });
  }

  async delete(publicId: string, resourceType: 'image' | 'raw' | 'video' = 'image') {
    return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  }

  getSignedDownloadUrl(publicId: string, resourceType: 'raw' | 'image' = 'raw'): string {
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      type: 'upload',
      sign_url: true,
      secure: true,
    });
  }

  async fetchRaw(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Impossible de télécharger le backup: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
