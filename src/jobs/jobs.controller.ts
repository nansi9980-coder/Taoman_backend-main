import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('public')
  findPublic() { return this.jobsService.findPublic(); }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() { return this.jobsService.findAll(); }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() data: any) { return this.jobsService.create(data); }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() data: any) {
    return this.jobsService.update(+id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) { return this.jobsService.remove(+id); }
}