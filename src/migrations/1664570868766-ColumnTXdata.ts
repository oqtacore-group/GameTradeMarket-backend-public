import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ColumnTXdata1664570868766 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'inventory.items',
      new TableColumn({
        type: 'varchar',
        name: 'tx_data',
        isUnique: false,
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('inventory.items', 'tx_data');
  }
}
