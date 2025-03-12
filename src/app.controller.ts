import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AppService } from './app.service';
import { MailchimpService } from './account/subscribe/mailchimp.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('/')
export class AppController {
  private logger = new Logger(AppController.name);

  constructor(
    private appService: AppService,
    private mailchimpService: MailchimpService,
  ) {}

  @Get('/discord/callback')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiExcludeEndpoint()
  handlerDiscordCallback(@Body() body: any) {
    this.logger.debug(`discord => ${JSON.stringify(body)}`);
    return;
  }

  @Get('/health')
  @Header('content-type', 'application/json')
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  async root() {
    return {
      service: 'OK',
      mail: await this.mailchimpService.checkStatus(),
    };
  }

  @Get('/sitemap-info')
  @ApiExcludeEndpoint()
  handlerSitemapInfo() {
    return this.appService.getSitemapInfo();
  }

  @Get('/schema.graphql')
  @Header('content-type', 'application/json')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  schema(): string {
    return this.appService.getSchema();
  }

  @Get('/favicon.ico')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiExcludeEndpoint()
  favicon() {
    return;
  }
}
