import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumBlockchainToItems1664570868778
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'inventory.items',
      new TableColumn({
        type: 'varchar',
        name: 'blockchain',
        isNullable: true,
      }),
    );
    await queryRunner.query(`
        update inventory.items set blockchain = 
        (select blockchain from inventory.contracts where contract = items.contract limit 1);
    `);
    // await queryRunner.changeColumn(
    //   'inventory.items',
    //   'blockchain',
    //   new TableColumn({
    //     name: 'blockchain',
    //     type: 'varchar',
    //     isNullable: false,
    //   }),
    // );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('inventory.items', 'blockchain');
  }
}
