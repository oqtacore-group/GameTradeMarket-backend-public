import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableUnique,
} from 'typeorm';

export class UserAchievements1664570868773 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_achievements',
        schema: 'account',
        columns: [
          new TableColumn({
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          }),
          new TableColumn({
            name: 'achievement_id',
            type: 'integer',
            isNullable: false,
          }),
        ],
      }),
    );
    const unqKeyUserAchievement = new TableUnique({
      columnNames: ['user_id', 'achievement_id'],
    });
    await queryRunner.createUniqueConstraint(
      'account.user_achievements',
      unqKeyUserAchievement,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('account.user_achievements');
  }
}
