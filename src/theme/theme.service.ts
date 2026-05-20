import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Palettes testées pour un bon contraste texte / fond */
export const THEME_PRESETS = [
  {
    name: 'TAOMAN Bleu Pro',
    primary: '#0052cc',
    secondary: '#003d9b',
    surface: '#f8fafc',
    background: '#eef2ff',
    isActive: true,
  },
  {
    name: 'TAOMAN Or & Marine',
    primary: '#d97706',
    secondary: '#14213d',
    surface: '#fffbf5',
    background: '#f1f5f9',
    isActive: false,
  },
  {
    name: 'Indigo Corporate',
    primary: '#4338ca',
    secondary: '#312e81',
    surface: '#ffffff',
    background: '#f1f5f9',
    isActive: false,
  },
  {
    name: 'Émeraude Business',
    primary: '#047857',
    secondary: '#065f46',
    surface: '#ffffff',
    background: '#ecfdf5',
    isActive: false,
  },
  {
    name: 'Ardoise Executive',
    primary: '#334155',
    secondary: '#0f172a',
    surface: '#f8fafc',
    background: '#e2e8f0',
    isActive: false,
  },
  {
    name: 'Bordeaux Prestige',
    primary: '#9f1239',
    secondary: '#881337',
    surface: '#fffafb',
    background: '#fff1f2',
    isActive: false,
  },
  {
    name: 'Cyan Tech',
    primary: '#0891b2',
    secondary: '#0e7490',
    surface: '#ffffff',
    background: '#ecfeff',
    isActive: false,
  },
  {
    name: 'Violet Moderne',
    primary: '#7c3aed',
    secondary: '#5b21b6',
    surface: '#faf5ff',
    background: '#f5f3ff',
    isActive: false,
  },
];

@Injectable()
export class ThemeService {
  constructor(private prisma: PrismaService) {}

  async getActiveTheme() {
    return this.prisma.themeSetting.findFirst({
      where: { isActive: true },
    });
  }

  async getAllThemes() {
    return this.prisma.themeSetting.findMany({
      orderBy: { id: 'asc' },
    });
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

  /** Crée ou met à jour les palettes recommandées (sans changer l'active). */
  async seedPresetThemes() {
    for (const preset of THEME_PRESETS) {
      const { isActive, ...data } = preset;
      await this.prisma.themeSetting.upsert({
        where: { name: preset.name },
        create: { ...data, isActive: false },
        update: data,
      });
    }
    const hasActive = await this.prisma.themeSetting.count({
      where: { isActive: true },
    });
    if (hasActive === 0) {
      const first = await this.prisma.themeSetting.findFirst({
        where: { name: 'TAOMAN Bleu Pro' },
      });
      if (first) {
        await this.setActiveTheme(first.id);
      }
    }
    return this.getAllThemes();
  }

  async initDefaultThemes() {
    const count = await this.prisma.themeSetting.count();
    if (count === 0) {
      await this.prisma.themeSetting.createMany({
        data: THEME_PRESETS,
      });
    } else {
      await this.seedPresetThemes();
    }
  }
}
