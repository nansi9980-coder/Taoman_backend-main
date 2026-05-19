import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // ── Routes publiques (site vitrine) ──────────────────────────────────────

  @Get('public')
  getPublicContent() {
    return this.contentService.getServiceCards();
  }

  @Get('services')
  getPublicServices() {
    return this.contentService.getServiceCards(true);
  }

  @Get('services/:id')
  getPublicServiceById(@Param('id') id: string) {
    return this.contentService.getServiceCardById(+id);
  }

  @Get('texts')
  getAllTexts() {
    return this.contentService.getSiteContents();
  }

  @Get('texts/:section')
  getTextBySection(@Param('section') section: string) {
    return this.contentService.getSiteContentBySection(section);
  }

  // ── Routes protégées (admin) ──────────────────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.contentService.getServiceCards();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() data: any) {
    return this.contentService.createServiceCard(data);
  }

  @Put('services/:id')
  @UseGuards(JwtAuthGuard)
  updateService(@Param('id') id: string, @Body() data: any) {
    return this.contentService.updateServiceCard(+id, data);
  }

  @Post('texts')
  @UseGuards(JwtAuthGuard)
  upsertText(@Body() body: { section: string; content: string }) {
    return this.contentService.upsertSiteContent(body.section, body.content);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() data: any) {
    return this.contentService.updateServiceCard(+id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.contentService.deleteServiceCard(+id);
  }
}