import { Controller, Get, Post, Param, UseGuards, Res, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { Response } from 'express';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  findAll(@Query('type') type?: string) {
    return this.reportsService.findAll(type);
  }

  @Post('generate/:type')
  async generateReport(@Param('type') type: string, @Res() res: Response) {
    const pdfBuffer = await this.reportsService.generatePdfReport(type);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=rapport-${type}-${new Date().toISOString().slice(0,10)}.pdf`,
    });
    res.send(pdfBuffer);
  }
}