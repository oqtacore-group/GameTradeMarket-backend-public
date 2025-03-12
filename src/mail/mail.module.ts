import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { SecretManagerModule } from '../utils/secret-manager/secret-manager.module';

@Module({
  imports: [SecretManagerModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
