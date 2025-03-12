import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserVisits1654847082270 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table account.user_visits
        (
            user_id   uuid not null,
            visited_at date not null
        );

        alter table account.user_visits
            owner to postgres;
            
        create unique index user_visits_visited_at_user_id_uindex
            on account.user_visits (visited_at, user_id);    
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('account.user_visits');
  }
}
