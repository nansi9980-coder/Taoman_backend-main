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

  async generatePdfReport(type: string, title?: string, notes?: string) {
    const data = await this.getData(type);
    const printer = new PdfPrinter({ Helvetica: { normal: 'Helvetica', bold: 'Helvetica-Bold' } });

    const headerLines: any[] = [
      { text: title?.trim() || `RAPPORT ${type.toUpperCase()}`, style: 'header' },
      { text: `Type : ${type} — ${new Date().toLocaleDateString('fr-FR')}`, margin: [0, 4, 0, 12] },
    ];

    if (notes?.trim()) {
      headerLines.push(
        { text: 'Notes', style: 'subheader', margin: [0, 8, 0, 4] },
        { text: notes.trim(), margin: [0, 0, 0, 16] },
      );
    }

    const docDefinition = {
      content: [...headerLines, ...this.formatData(type, data)],
      styles: {
        header: { fontSize: 22, bold: true },
        subheader: { fontSize: 14, bold: true },
      },
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
      case 'quotes':
        return this.prisma.quote.findMany({ include: { client: true } });
      case 'clients':
        return this.prisma.client.findMany();
      case 'investments':
        return this.prisma.investment.findMany();
      case 'global': {
        const [quotes, clients, investments] = await Promise.all([
          this.prisma.quote.count(),
          this.prisma.client.count(),
          this.prisma.investment.count(),
        ]);
        return [{ quotes, clients, investments }];
      }
      default:
        return [];
    }
  }

  private formatData(type: string, data: any[]) {
    if (type === 'global' && data[0]) {
      const g = data[0];
      return [
        { text: 'Synthèse globale', style: 'subheader', margin: [0, 0, 0, 8] },
        { text: `Devis : ${g.quotes}` },
        { text: `Clients : ${g.clients}` },
        { text: `Investissements : ${g.investments}` },
      ];
    }

    if (!Array.isArray(data) || data.length === 0) {
      return [{ text: 'Aucun enregistrement pour ce type.' }];
    }

    const lines = data.slice(0, 50).map((row: any) => {
      if (type === 'quotes') {
        return { text: `• ${row.title || 'Devis'} — ${row.status || ''} (${row.client?.name || 'N/A'})`, margin: [0, 2, 0, 2] };
      }
      if (type === 'clients') {
        return { text: `• ${row.name} — ${row.email}`, margin: [0, 2, 0, 2] };
      }
      if (type === 'investments') {
        return { text: `• ${row.name} — ${row.amount} FCFA`, margin: [0, 2, 0, 2] };
      }
      return { text: `• ${JSON.stringify(row).slice(0, 80)}...` };
    });

    if (data.length > 50) {
      lines.push({ text: `… et ${data.length - 50} autres enregistrements`, margin: [0, 8, 0, 0] });
    }

    return [{ text: `${data.length} enregistrement(s)`, margin: [0, 0, 0, 8] }, ...lines];
  }
}
