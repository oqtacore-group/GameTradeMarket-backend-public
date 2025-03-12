import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MailchimpService {
  private readonly _authHeader: string;
  private readonly _basicUri: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this._basicUri = `https://${this.configService.get(
      'MAILCHIMP_SERVER',
    )}.api.mailchimp.com/3.0`;
    this._authHeader = `Basic ${Buffer.from(
      `anystring:${this.configService.get('MAILCHIMP_KEY')}`,
    ).toString('base64')}`;
  }
  async checkStatus(): Promise<string> {
    const response = await lastValueFrom(
      this.httpService.get(`${this._basicUri}/ping`, {
        headers: { Authorization: this._authHeader },
      }),
    );
    return response.data?.health_status == "Everything's Chimpy!"
      ? 'OK'
      : 'Fail';
  }
  async addContact(email: string) {
    const response = await lastValueFrom(
      this.httpService.post(
        `${this._basicUri}/lists/${this.configService.get(
          'MAILCHIMP_SUBSCRIBE_LIST_ID',
        )}/members`,
        {
          email_address: email,
          status: 'pending',
          tags: ['Newsletter'],
        },
        {
          headers: {
            Authorization: this._authHeader,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
    return response.data;
  }
}
