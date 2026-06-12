import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuotesService } from './quotes.service';
import { assertPdfUpload } from '../common/pdf-upload.util';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post('submit')
  @UseInterceptors(FileInterceptor('attachment'))
  submitQuote(
    @Body()
    data: {
      name: string;
      email?: string;
      phone?: string;
      address?: string;
      title: string;
      description?: string;
      service?: string;
      userId?: number;
    },
    @UploadedFile() attachment?: Express.Multer.File,
  ) {
    assertPdfUpload(attachment);
    const description =
      data.description ||
      (data.service ? `Service demandé: ${data.service}` : undefined);

    return this.quotesService.submitQuote(
      {
        clientName: data.name,
        clientEmail: data.email,
        clientPhone: data.phone,
        address: data.address,
        title: data.title,
        description,
        service: data.service,
        userId: data.userId ? Number(data.userId) : undefined,
      },
      attachment,
    );
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
