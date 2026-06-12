import { BadRequestException } from '@nestjs/common';

export function assertPdfUpload(file?: Express.Multer.File) {
  if (!file) return;
  const isPdf =
    file.mimetype === 'application/pdf' ||
    file.originalname?.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    throw new BadRequestException('Seuls les fichiers PDF sont acceptés');
  }
}
