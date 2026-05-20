import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  async getMedia() {
    return this.mediaService.findAll();
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: { category?: string }) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    return this.mediaService.uploadFile(file, body.category || 'general');
  }

  @Post('migrate-to-cloudinary')
  @UseGuards(JwtAuthGuard)
  migrateToCloudinary() {
    return this.mediaService.migrateToCloudinary();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteMedia(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.delete(id);
  }
}
