import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UserActiveGameAddSessionAt1664570868774
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'inventory.source_user_active',
      new TableColumn({
        name: 'session_at',
        type: 'date',
        isNullable: false,
        default: 'now()',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('inventory.source_user_active', 'session_at');
  }
}
