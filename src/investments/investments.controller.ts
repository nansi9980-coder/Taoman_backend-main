import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InvestmentsService } from './investments.service';

@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Get('public')
  findPublic() {
    return this.investmentsService.findPublic();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.investmentsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.investmentsService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() data: { name: string; description?: string; amount: number; risk?: string }) {
    return this.investmentsService.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() data: Partial<{ name: string; description?: string; amount: number; roi?: number; risk?: string; status?: string }>) {
    return this.investmentsService.update(+id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.investmentsService.remove(+id);
  }
}