import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private telegramService: TelegramService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(
        () => {
          return;
        },
        (error) => {
          if (error.status === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.telegramService
              .sendErrorLog('ERROR', error, {
                request: context.getArgs()[3]?.fieldName ?? 'None',
                params: JSON.stringify(context.getArgs()[1] ?? ''),
              })
              .subscribe();
          }
        },
      ),
    );
  }
}
