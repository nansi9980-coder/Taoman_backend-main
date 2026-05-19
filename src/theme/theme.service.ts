import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ThemeService {
  constructor(private prisma: PrismaService) {}

  async getActiveTheme() {
    return this.prisma.themeSetting.findFirst({
      where: { isActive: true },
    });
  }

  async getAllThemes() {
    return this.prisma.themeSetting.findMany();
  }

  async setActiveTheme(id: number) {
    await this.prisma.themeSetting.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
    return this.prisma.themeSetting.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async createTheme(data: any) {
    return this.prisma.themeSetting.create({ data });
  }

  async initDefaultThemes() {
    const count = await this.prisma.themeSetting.count();
    if (count === 0) {
      await this.prisma.themeSetting.createMany({
        data: [
          { name: 'Taoman Original', primary: '#fca311', secondary: '#14213d', surface: '#ffffff', background: '#e5e5e5', isActive: true },
          { name: 'Ocean Blue', primary: '#023e8a', secondary: '#0077b6', surface: '#f0f4f8', background: '#caf0f8', isActive: false },
          { name: 'Forest Green', primary: '#2d6a4f', secondary: '#1b4332', surface: '#e9ecef', background: '#d8f3dc', isActive: false },
          { name: 'Dark Mode', primary: '#fca311', secondary: '#14213d', surface: '#121212', background: '#000000', isActive: false },
        ]
      });
    }
  }
}
