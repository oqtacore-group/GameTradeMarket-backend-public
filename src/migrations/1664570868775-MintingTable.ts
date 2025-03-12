import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class LaunchpadTable1664570868775 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'launchpad',
        schema: 'inventory',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
          }),
          new TableColumn({
            name: 'game_code',
            type: 'varchar',
          }),
          new TableColumn({
            name: 'title',
            type: 'varchar',
          }),
          new TableColumn({
            name: 'description',
            type: 'text',
            isNullable: true,
          }),
          new TableColumn({
            name: 'utility',
            type: 'text',
            isNullable: true,
          }),
          new TableColumn({
            name: 'contract',
            type: 'varchar',
          }),
          new TableColumn({
            name: 'blockchain',
            type: 'varchar',
          }),
          new TableColumn({
            name: 'media',
            type: 'jsonb',
          }),
          new TableColumn({
            name: 'start_mint',
            type: 'timestamp',
          }),
          new TableColumn({
            name: 'start_price',
            type: 'varchar',
          }),
          new TableColumn({
            name: 'amount_items',
            type: 'numeric',
          }),
          new TableColumn({
            name: 'roadmap',
            type: 'jsonb',
            isNullable: true,
          }),
          new TableColumn({
            name: 'is_hidden',
            type: 'boolean',
            default: false,
          }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('inventory.launchpad');
  }
}
