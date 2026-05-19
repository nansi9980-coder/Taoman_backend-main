import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { ThemeService } from './theme.service';

@Controller('theme')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get('active')
  getActiveTheme() {
    return this.themeService.getActiveTheme();
  }

  @Get()
  getAllThemes() {
    return this.themeService.getAllThemes();
  }

  @Post('init')
  initThemes() {
    return this.themeService.initDefaultThemes();
  }

  @Put('active/:id')
  setActiveTheme(@Param('id') id: string) {
    return this.themeService.setActiveTheme(Number(id));
  }
}
