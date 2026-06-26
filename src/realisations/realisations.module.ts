import { Module } from '@nestjs/common';
import { RealisationsController } from './realisations.controller';
import { RealisationsService } from './realisations.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RealisationsController],
  providers: [RealisationsService, PrismaService],
})
export class RealisationsModule {}
