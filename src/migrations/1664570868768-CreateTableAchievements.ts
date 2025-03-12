import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class CreateTableAchievements1664570868768
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'achievements',
        schema: 'inventory',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
          }),
          new TableColumn({
            name: 'name',
            type: 'varchar',
          }),
          new TableColumn({
            name: 'description',
            type: 'text',
          }),
          new TableColumn({
            name: 'image_url',
            type: 'varchar',
          }),
          new TableColumn({
            name: 'score',
            type: 'integer',
          }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('inventory.achievements');
  }
}
