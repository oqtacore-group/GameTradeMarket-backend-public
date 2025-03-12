import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnImxOrderIdToInventory1664570868765
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'inventory.items',
      new TableColumn({
        name: 'imxOrderId',
        type: 'integer',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('inventory.items', 'imxOrderId');
  }
}
