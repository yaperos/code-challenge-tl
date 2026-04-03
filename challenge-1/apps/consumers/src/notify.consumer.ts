import { Controller, Logger, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ProcessedEventsRepository } from './processed-events.repository';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class NotifyConsumer {
  private readonly logger = new Logger(NotifyConsumer.name);
  private readonly brevoApiKey = process.env.BREVO_API_KEY;
  private readonly targetEmail = process.env.NOTIFY_TARGET_EMAIL || 'franklin.barrios@icloud.com';
  private readonly senderEmail = process.env.SENDER_EMAIL || 'bestfrank2020@gmail.com';
  private readonly consumerName = 'NotifyConsumer';

  constructor(
    private readonly processedRepo: ProcessedEventsRepository,
  ) {}

  private getTemplate(templateName: string, data: any): string {
    const templatePath = path.join(process.cwd(), 'templates', `${templateName}.html`);

    try {
      let content = fs.readFileSync(templatePath, 'utf8');

      // Map variables
      Object.keys(data).forEach(key => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(placeholder, data[key]);
      });

      return content;
    } catch (error) {
      this.logger.error(`Error loading template ${templateName}: ${error.message}`);
      return `Error loading template: ${templateName}`;
    }
  }

  @EventPattern([
    'pe.payment.created.v1',
    'mx.payment.created.v1',
    'co.payment.created.v1',
    'gen.payment.created.v1'
  ])
  async handlePaymentCreated(@Payload() message: any): Promise<void> {
    const eventId = message.eventId || message.id; // Using id as fallback if eventId not present
    const aggregateId = message.aggregateId || message.id;
    const amount = message.amount || '---';
    const currency = message.currency || '';

    if (!eventId) {
      this.logger.warn('Received message without eventId/id, skipping');
      return;
    }

    const alreadyProcessed = await this.processedRepo.exists(eventId, this.consumerName);
    if (alreadyProcessed) {
      this.logger.log(`Event ${eventId} already processed by ${this.consumerName}, skipping email.`);
      return;
    }

    this.logger.log(`Sending process notification for payment ${aggregateId}`);

    // Mark as processed BEFORE sending to ensure atomicity (at-least-once with DB record)
    await this.processedRepo.markProcessed(eventId, this.consumerName);

    const html = this.getTemplate('ok', {
      id: aggregateId,
      amount: amount,
      currency: currency === 'USD' ? '$' : currency,
      status: 'PENDING'
    });

    await this.sendEmail(`Hemos recibido tu pago: ${aggregateId}`, html);
  }

  private async sendEmail(subject: string, htmlContent: string): Promise<void> {
    try {
      if (!this.brevoApiKey) {
        this.logger.error('BREVO_API_KEY is not defined in environment variables');
        return;
      }

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': this.brevoApiKey,
          'content-type': 'application/json',
        } as any,
        body: JSON.stringify({
          sender: { name: 'Yape Payment Pipeline', email: this.senderEmail },
          to: [{ email: this.targetEmail, name: 'Franklin Barrios' }],
          subject,
          htmlContent,
        }),
      });

      const responseData = await response.json();
      this.logger.log(`Brevo API Response [${response.status}]: ${JSON.stringify(responseData)}`);

      if (!response.ok) {
        this.logger.error(`Failed to send email via Brevo: ${JSON.stringify(responseData)}`);
      } else {
        this.logger.log(`Notification email sent. MessageId: ${responseData.messageId}`);
      }
    } catch (error) {
      this.logger.error(`Error sending email to Brevo: ${error.message}`);
    }
  }
}
