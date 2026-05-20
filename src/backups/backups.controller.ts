import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  ParseIntPipe,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { BackupsService } from './backups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('backups')
@UseGuards(JwtAuthGuard)
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) {}

  @Get()
  async getBackups() {
    return this.backupsService.findAll();
  }

  @Post()
  async runBackup() {
    return this.backupsService.runBackup();
  }

  @Get(':id/download')
  async downloadBackup(@Param('id', ParseIntPipe) id: number, @Res({ passthrough: true }) res: Response) {
    const { filename, buffer } = await this.backupsService.getDownloadPayload(id);
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }

  @Post(':id/restore')
  async restoreBackup(@Param('id', ParseIntPipe) id: number) {
    return this.backupsService.restore(id);
  }

  @Delete(':id')
  async deleteBackup(@Param('id', ParseIntPipe) id: number) {
    return this.backupsService.delete(id);
  }
}
