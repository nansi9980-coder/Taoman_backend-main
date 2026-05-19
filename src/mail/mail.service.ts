import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend?: Resend;
  private readonly fromAddress: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromAddress = process.env.MAIL_FROM || 'onboarding@resend.dev';

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY non défini. Les emails sont désactivés.');
      return;
    }

    this.resend = new Resend(apiKey);
  }

  async sendOtp(email: string, otp: string) {
    if (!this.resend) {
      this.logger.warn(`Email OTP ignoré pour ${email} : clé API manquante.`);
      return;
    }

    await this.resend.emails.send({
      from: this.fromAddress,
      to: email,
      subject: 'Votre code de vérification — Taoman',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
          <h2 style="color:#003d9b">Taoman Groupe</h2>
          <p>Votre code de vérification est :</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#003d9b;margin:24px 0">${otp}</div>
          <p style="color:#666;font-size:13px">Ce code expire dans 10 minutes. Ne le partagez avec personne.</p>
        </div>
      `,
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.warn(`Email ignoré pour ${to} : clé API manquante.`);
      return;
    }

    await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject,
      html,
    });
  }
}