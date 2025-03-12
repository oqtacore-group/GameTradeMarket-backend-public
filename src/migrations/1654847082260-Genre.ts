import { MigrationInterface, QueryRunner } from 'typeorm';

export class Genre1654847082260 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        create table inventory.genres
          (
              code   varchar
                  constraint genres_pk
                      primary key,
              name varchar not null
          );
          
          alter table inventory.genres
              owner to postgres;
          
          create unique index genres_name_uindex
              on inventory.genres (name);
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table inventory.genres;`);
  }
}
