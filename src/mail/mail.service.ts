import { Injectable, Logger } from '@nestjs/common';
import { IMailSend, IMailSendParams } from './mail.interface';
import * as path from 'path';
import { promises as fs } from 'fs';
import Mustache from 'mustache';
import { SES } from 'aws-sdk';
import { SecretManagerService } from '../utils/secret-manager/secret-manager.service';

@Injectable()
export class MailService {
  readonly logger = new Logger(MailService.name);
  templatePath: string = path.resolve(__dirname, 'templates');
  readonly client: SES;

  constructor(private readonly secretManagerService: SecretManagerService) {
    this.client = new SES();
  }

  private async _renderTemplate(templateName: string, params: IMailSendParams) {
    const targetPath = path.join(this.templatePath, templateName);
    const txtPath = path.join(targetPath, 'body.txt');
    const textTemplate = await fs.readFile(txtPath);
    const text = Mustache.render(textTemplate.toString('utf-8'), params);
    const htmlPath = path.join(targetPath, 'body.html');
    const htmlTemplate = await fs.readFile(htmlPath);
    const html = Mustache.render(htmlTemplate.toString('utf-8'), params);
    return { text, html };
  }

  async send({
    from,
    to,
    subject,
    templateName,
    params,
  }: IMailSend): Promise<void> {
    const { html } = await this._renderTemplate(templateName, {
      ...params,
      host: this.secretManagerService.configService.get('CLIENT_HOST'),
    });
    try {
      await this.client
        .sendEmail({
          Source: from,
          Destination: {
            ToAddresses: [to],
          },
          Message: {
            Subject: {
              Data: subject,
            },
            Body: {
              Html: {
                Data: html,
              },
            },
          },
        })
        .promise();
    } catch (err) {
      this.logger.error(err);
    }
  }
}
