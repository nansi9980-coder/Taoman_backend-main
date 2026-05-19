import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
const PdfPrinter = require('pdfmake');

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async findAll(type?: string) {
    if (type === 'quotes') return this.prisma.quote.findMany({ include: { client: true } });
    if (type === 'clients') return this.prisma.client.findMany();
    if (type === 'investments') return this.prisma.investment.findMany();

    return {
      quotes: await this.prisma.quote.count(),
      clients: await this.prisma.client.count(),
      investments: await this.prisma.investment.count(),
    };
  }

  async generatePdfReport(type: string) {
    const data = await this.getData(type);
    const printer = new PdfPrinter({ Helvetica: { normal: 'Helvetica', bold: 'Helvetica-Bold' } });

    const docDefinition = {
      content: [
        { text: `RAPPORT ${type.toUpperCase()}`, style: 'header' },
        { text: new Date().toLocaleDateString('fr-FR'), alignment: 'right', margin: [0, 0, 0, 20] },
        ...this.formatData(type, data)
      ],
      styles: { header: { fontSize: 22, bold: true } }
    };

    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }

  private async getData(type: string) {
    switch (type) {
      case 'quotes': return this.prisma.quote.findMany({ include: { client: true } });
      case 'clients': return this.prisma.client.findMany();
      case 'investments': return this.prisma.investment.findMany();
      default: return [];
    }
  }

  private formatData(type: string, data: any[]) {
    return [{ text: `${data.length} enregistrements` }];
  }
}