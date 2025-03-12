import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFieldIsPartnerInGames1664570868768
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'inventory.sources',
      new TableColumn({
        type: 'bool',
        name: 'is_partner',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('inventory.sources', 'is_partner');
  }
}
