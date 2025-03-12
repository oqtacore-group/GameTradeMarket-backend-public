import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class PlayerToken1664570868771 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'account.users',
      new TableColumn({
        name: 'player_token',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('account.users', 'player_token');
  }
}
