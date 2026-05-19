import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuotesService } from './quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post('submit')
  submitQuote(@Body() data: { name: string; email: string; phone?: string; title: string; description?: string; service?: string; userId?: number }) {
    return this.quotesService.submitQuote({
      clientName: data.name,
      clientEmail: data.email,
      clientPhone: data.phone,
      title: data.title,
      description: data.description || `Service demandé: ${data.service || 'Non spécifié'}`,
      service: data.service,
      userId: data.userId,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.quotesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() data: { title: string; description?: string; amount?: number; clientId: number; service?: string; status?: string }) {
    return this.quotesService.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() data: Partial<{ title: string; description?: string; status?: string; amount?: number }>) {
    return this.quotesService.update(+id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.quotesService.remove(+id);
  }

  @Post(':id/generate-pdf')
  @UseGuards(JwtAuthGuard)
  generatePdf(@Param('id') id: string) {
    return this.quotesService.generatePdf(+id);
  }
}