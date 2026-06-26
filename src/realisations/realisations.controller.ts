import { Controller, Get, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { RealisationsService } from './realisations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('realisations')
export class RealisationsController {
  constructor(private readonly realisationsService: RealisationsService) {}

  @Get()
  async getAll() {
    return this.realisationsService.getAll();
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  async syncFromMedia(@Body() body: { items: any[] }) {
    if (!Array.isArray(body.items)) {
      throw new BadRequestException('Items must be an array');
    }
    return this.realisationsService.syncFromMedia(body.items);
  }

  @Post('update')
  @UseGuards(JwtAuthGuard)
  async update(@Body() body: any) {
    return this.realisationsService.update(body);
  }
}
