import { Controller, Get, Post, Delete, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
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

  @Delete(':id')
  async deleteBackup(@Param('id', ParseIntPipe) id: number) {
    return this.backupsService.delete(id);
  }
}
