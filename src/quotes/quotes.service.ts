import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { LogsService } from '../logs/logs.service';
import { NotificationsService } from '../notifications/notifications.service';
const PdfPrinter = require('pdfmake');

@Injectable()
export class QuotesService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
    private logsService: LogsService,
    private notificationsService: NotificationsService,
  ) {}

  findAll() {
    return this.prisma.quote.findMany({
      include: { client: true, user: true },
    });
  }

  findOne(id: number) {
    return this.prisma.quote.findUnique({
      where: { id },
      include: { client: true, user: true },
    });
  }

  async create(data: {
    title: string;
    description?: string;
    amount?: number;
    clientId: number;
    service?: string;
    status?: string;
  }) {
    const quote = await this.prisma.quote.create({ data });
    await this.afterQuoteMutation(quote, 'create', 'admin');
    return quote;
  }

  async update(
    id: number,
    data: Partial<{ title: string; description?: string; status?: string; amount?: number }>,
  ) {
    const quote = await this.prisma.quote.update({
      where: { id },
      data,
      include: { client: true, user: true },
    });
    this.eventsGateway.emitQuoteUpdated(quote);
    await this.logsService.createLog('admin', 'update', 'quote', 'success', '0.0.0.0', `Devis #${id}`);
    return quote;
  }

  async submitQuote(data: {
    title: string;
    description?: string;
    clientEmail: string;
    clientName: string;
    clientPhone?: string;
    service?: string;
    userId?: number;
  }) {
    let client = await this.prisma.client.findUnique({
      where: { email: data.clientEmail },
    });

    if (!client) {
      client = await this.prisma.client.create({
        data: {
          name: data.clientName,
          email: data.clientEmail,
          phone: data.clientPhone,
        },
      });
    }

    const quote = await this.prisma.quote.create({
      data: {
        title: data.title,
        description: data.description,
        service: data.service,
        clientId: client.id,
        userId: data.userId,
      },
      include: { client: true, user: true },
    });

    await this.afterQuoteMutation(quote, 'submit', 'vitrine');
    return quote;
  }

  remove(id: number) {
    return this.prisma.quote.delete({ where: { id } });
  }

  private async afterQuoteMutation(quote: any, action: string, source: string) {
    this.eventsGateway.emitQuote(quote);
    await this.logsService.createLog(
      source,
      action,
      'quote',
      'success',
      '0.0.0.0',
      `Devis #${quote.id} - ${quote.title}`,
    );
    await this.notificationsService.create({
      type: 'quote',
      title: 'Nouveau devis',
      message: `${quote.title} — ${quote.client?.name || 'Client'}`,
    });
  }

  async generatePdf(id: number): Promise<{ url: string }> {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: { client: true, user: true },
    });

    if (!quote) throw new Error('Quote not found');

    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    };

    const printer = new PdfPrinter(fonts);

    const docDefinition = {
      defaultStyle: { font: 'Helvetica' },
      content: [
        { text: 'DEVIS', style: 'header' },
        { text: 'Taoman Groupe\nLomé, Togo', margin: [0, 10, 0, 20] },
        { text: `Client: ${quote.client?.name || quote.user?.firstName || 'Client'}` },
        { text: `Email: ${quote.client?.email || quote.user?.email || 'N/A'}` },
        { text: `Téléphone: ${quote.client?.phone || 'N/A'}`, margin: [0, 0, 0, 20] },
        { text: `Service demandé: ${quote.service || quote.title}`, style: 'subheader' },
        { text: `Description:\n${quote.description || 'N/A'}`, margin: [0, 10, 0, 20] },
        {
          text: `Montant estimé: ${quote.amount ? quote.amount + ' FCFA' : 'Sur devis'}`,
          style: 'total',
          margin: [0, 20, 0, 0],
        },
      ],
      styles: {
        header: { fontSize: 24, bold: true, alignment: 'right' as any },
        subheader: { fontSize: 16, bold: true },
        total: { fontSize: 18, bold: true, color: '#003d9b' },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', async () => {
        const pdfBuffer = Buffer.concat(chunks);
        const base64 = pdfBuffer.toString('base64');
        const dataUrl = `data:application/pdf;base64,${base64}`;

        const updated = await this.prisma.quote.update({
          where: { id },
          data: { pdfUrl: dataUrl, status: 'Envoyé' },
          include: { client: true, user: true },
        });

        this.eventsGateway.emitQuoteUpdated(updated);
        resolve({ url: dataUrl });
      });
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }
}
