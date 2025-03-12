import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, map, Observable, of } from 'rxjs';
import { ParseMode } from './enums';

@Injectable()
export class TelegramService {
  private logger = new Logger(TelegramService.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  sendErrorLog(
    title: string,
    error: any,
    context: Record<any, string>,
  ): Observable<void> {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.configService.get<string>('TELEGRAM_CHANNEL_LOG_ERROR');
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const errorData = error?.stack;
    const errorStatus: number = error?.response?.status ?? error?.status;

    let message = `<b>${title}</b>\n<pre>${error}</pre>\n`;

    if (errorStatus) {
      message += `Status: <b>${errorStatus}</b>\n`;
    }

    if (errorData) {
      message += `Stack: <pre>${JSON.stringify(errorData)}</pre>\n`;
    }

    if (context) {
      message += `<b>request:</b> <pre>${context?.request}</pre>\n`;
      message += `<b>params:</b> <pre>${context?.params}</pre>\n`;
    }

    return this.httpService
      .get(url, {
        params: {
          chat_id: chatId,
          parse_mode: ParseMode.HTML,
          text: message,
          disable_web_page_preview: true,
        },
      })
      .pipe(
        map(() => null),
        catchError((error) => {
          this.logger.error(`send => ${error.message}`);

          return of(null);
        }),
      );
  }
}
