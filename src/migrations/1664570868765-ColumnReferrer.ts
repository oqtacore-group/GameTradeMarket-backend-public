import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ColumnReferrer1664570868765 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('account.users', [
      new TableColumn({
        type: 'varchar',
        name: 'referrerLink',
        isUnique: false,
        isNullable: true,
      }),
      new TableColumn({
        type: 'varchar',
        name: 'invitedBy',
        isUnique: false,
        isNullable: true,
      }),
      new TableColumn({
        type: 'varchar',
        name: 'promoCode',
        isUnique: true,
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('account.users', 'promoCode');
    await queryRunner.dropColumn('account.users', 'invitedBy');
    await queryRunner.dropColumn('account.users', 'referrerLink');
  }
}
