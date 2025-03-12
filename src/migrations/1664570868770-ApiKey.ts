import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  Table,
  TableUnique,
  TableForeignKey,
} from 'typeorm';

export class ApiKey1664570868770 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('admin.access_keys', [
      new TableColumn({
        name: 'expires',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'env',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'last_activity',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'is_active',
        type: 'boolean',
        isNullable: true,
      }),
    ]);
    await queryRunner.renameTable('admin.access_keys', 'api_keys');
    await queryRunner.createTable(
      new Table({
        name: 'access_keys_games',
        schema: 'admin',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            isNullable: false,
          }),
          new TableColumn({
            name: 'api_key',
            type: 'varchar',
            isNullable: false,
          }),
          new TableColumn({
            name: 'game_code',
            type: 'varchar',
            isNullable: false,
          }),
        ],
      }),
    );
    const unqKeyGameApiKey = new TableUnique({
      columnNames: ['api_key', 'game_code'],
    });
    const foreignKeyGame = new TableForeignKey({
      columnNames: ['game_code'],
      referencedColumnNames: ['code'],
      referencedTableName: 'sources',
      referencedSchema: 'inventory',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    await queryRunner.createUniqueConstraint(
      'admin.access_keys_games',
      unqKeyGameApiKey,
    );
    await queryRunner.createForeignKey(
      'admin.access_keys_games',
      foreignKeyGame,
    );
    await queryRunner.addColumn(
      'inventory.achievements',
      new TableColumn({
        name: 'game_code',
        type: 'varchar',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('inventory.achievements', 'game_code');
    await queryRunner.dropTable('admin.access_keys_games');
    await queryRunner.dropColumns('admin.api_keys', [
      'expires',
      'env',
      'last_activity',
      'is_active',
    ]);
    await queryRunner.renameTable('admin.api_keys', 'admin.access_keys');
  }
}
