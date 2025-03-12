import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddColumnGameCodeToItems1664570868777
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'inventory.items',
      new TableColumn({
        type: 'varchar',
        name: 'game_code',
        isNullable: true,
      }),
    );
    await queryRunner.query(`
        update inventory.items set game_code = 
        (select game_code from inventory.contracts where contract = items.contract limit 1);
    `);
    // await queryRunner.changeColumn(
    //   'inventory.items',
    //   'game_code',
    //   new TableColumn({
    //     type: 'varchar',
    //     name: 'game_code',
    //     isNullable: false,
    //   }),
    // );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('inventory.items', 'game_code');
  }
}
