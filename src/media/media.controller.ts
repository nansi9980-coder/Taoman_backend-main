import { Controller, Get, Post, Delete, Param, UseInterceptors, UploadedFile, UseGuards, ParseIntPipe, BadRequestException, Body } from '@nestjs/common';
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
  async uploadFile(@UploadedFile() file: any, @Body() body: any) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    
    // file has path, filename, size, mimetype
    const url = `/uploads/${file.filename}`;
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const category = body.category || 'general';
    
    return this.mediaService.saveMediaInfo(file.originalname, file.mimetype, sizeInMB, url, category);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteMedia(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.delete(id);
  }
}
