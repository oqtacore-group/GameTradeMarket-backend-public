import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class CoinInfo1664570868775 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'coin_info',
        schema: 'inventory',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            isNullable: false,
          }),
          new TableColumn({
            name: 'name',
            type: 'varchar',
            isNullable: false,
          }),
          new TableColumn({
            name: 'symbol',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          }),
          new TableColumn({
            name: 'decimals',
            type: 'integer',
            isNullable: false,
          }),
          new TableColumn({
            name: 'blockchain',
            type: 'varchar',
            isNullable: false,
          }),
          new TableColumn({
            name: 'price',
            type: 'integer',
            default: 0,
          }),
          new TableColumn({
            name: 'contract',
            type: 'varchar',
            isNullable: false,
          }),
          new TableColumn({
            name: 'external_id',
            type: 'varchar',
            isNullable: false,
          }),
          new TableColumn({
            name: 'external_platform',
            type: 'varchar',
            isNullable: false,
          }),
          new TableColumn({
            name: 'thumbnail_url',
            type: 'varchar',
            isNullable: false,
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('inventory.coin_info', true);
  }
}
