import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class ChangeColumnsSourceCurrencies1664570868776
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('inventory.source_currencies', [
      'coin_name',
      'blockchain_code',
      'contract_address',
      'decimals',
      'logo',
      'created_at',
      'price',
      'gecko_id',
      'hidden',
    ]);
    await queryRunner.addColumn(
      'inventory.source_currencies',
      new TableColumn({
        name: 'coin_id',
        type: 'integer',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('inventory.source_currencies', [
      new TableColumn({
        name: 'coin_name',
        type: 'varchar',
        isNullable: false,
      }),
      new TableColumn({
        name: 'blockchain_code',
        type: 'varchar',
        isNullable: false,
      }),
      new TableColumn({
        name: 'contract_address',
        type: 'varchar',
        isNullable: false,
      }),
      new TableColumn({
        name: 'decimals',
        type: 'integer',
        isNullable: false,
      }),
      new TableColumn({
        name: 'logo',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'created_at',
        type: 'timestamp',
        isNullable: false,
        default: 'now()',
      }),
      new TableColumn({
        name: 'price',
        type: 'real',
        isNullable: true,
      }),
      new TableColumn({
        name: 'gecko_id',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'hidden',
        type: 'boolean',
        default: false,
      }),
    ]);

    const foreignKeyBlockchain = new TableForeignKey({
      columnNames: ['blockchain_code'],
      referencedColumnNames: ['code'],
      referencedTableName: 'blockchain.networks',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryRunner.createForeignKey(
      'inventory.source_currencies',
      foreignKeyBlockchain,
    );
    await queryRunner.dropColumn('inventory.source_currencies', 'coin_id');
  }
}
