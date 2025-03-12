import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableUnique,
} from 'typeorm';

export class UserActiveGame1664570868772 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'source_user_active',
        schema: 'inventory',
        columns: [
          new TableColumn({
            name: 'user_id',
            type: 'varchar',
            isNullable: false,
          }),
          new TableColumn({
            name: 'game_code',
            type: 'varchar',
            isNullable: false,
          }),
          new TableColumn({
            name: 'duration',
            type: 'integer',
            isNullable: false,
            default: 0,
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('inventory.source_user_active');
  }
}
