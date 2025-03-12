import { Injectable } from '@nestjs/common';
import { SecretsManager } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecretManagerService {
  private readonly client: SecretsManager;
  constructor(readonly configService: ConfigService) {
    this.client = new SecretsManager();
  }

  async getSecretValue<T>(key: string): Promise<T | string> {
    /** Retrieving data from AWS Secret Manager */
    if (!key) return null;
    return new Promise((resolve, reject) => {
      this.client.getSecretValue(
        {
          SecretId: `arn:aws:secretsmanager:${this.configService.get(
            'AWS_REGION',
          )}:${this.configService.get(
            'AWS_ACCOUNT_ID',
          )}:secret:${this.configService.get(key)}`,
        },
        (err, data) => {
          if (err) {
            switch (err.code) {
              case 'DecryptionFailureException':
                return reject(err);
              case 'InternalServiceErrorException':
                return reject(err);
              case 'InvalidParameterException':
                return reject(err);
              case 'InvalidRequestException':
                return reject(err);
              case 'ResourceNotFoundException':
                return reject(err);
              default:
                return reject(err);
            }
          }
          if ('SecretString' in data) {
            try {
              return resolve(JSON.parse(data.SecretString));
            } catch (err) {
              return resolve(data.SecretString);
            }
          } else {
            return resolve(
              Buffer.from(data.SecretBinary as string, 'base64').toString(
                'ascii',
              ),
            );
          }
        },
      );
    });
  }
}
