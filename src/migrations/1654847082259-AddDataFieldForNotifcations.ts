import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDataFieldForNotifications1654847082259
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE account.notifications ADD COLUMN data JSONB NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE account.notifications DROP COLUMN data`,
    );
  }
}
