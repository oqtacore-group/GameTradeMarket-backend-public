import { MigrationInterface, QueryRunner } from 'typeorm';

export class Platform1654847082264 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      create table inventory.platforms
        (
            id   serial
                constraint platforms_pk
                    primary key,
            name varchar not null
        );
        
        alter table inventory.platforms
            owner to postgres;
        
        create unique index platforms_name_uindex
            on inventory.platforms (name);
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table inventory.platforms;`);
  }
}
