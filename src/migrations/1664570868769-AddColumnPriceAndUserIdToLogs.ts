import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnPriceAndUserIdToLogs1664570868769
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('inventory.item_update_log', [
      new TableColumn({
        type: 'numeric',
        name: 'price',
        isUnique: false,
        isNullable: true,
      }),
      new TableColumn({
        type: 'varchar',
        name: 'user_id',
        isUnique: false,
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('inventory.item_update_log', 'price');
    await queryRunner.dropColumn('inventory.item_update_log', 'user_id');
  }
}
