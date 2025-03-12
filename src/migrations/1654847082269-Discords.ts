import { MigrationInterface, QueryRunner } from 'typeorm';

export class Discords1654847082269 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table inventory.discords
        (
            id          integer                 not null
                constraint discords_pk
                    primary key,
            username    varchar                 not null,
            create_time timestamp default now() not null
        );

        alter table inventory.discords
            owner to postgres;

        create unique index discords_username_uindex
            on inventory.discords (username);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('account.discords');
  }
}
