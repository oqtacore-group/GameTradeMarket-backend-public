import { MigrationInterface, QueryRunner } from 'typeorm';

export class Mode1654847082261 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      create table inventory.modes
        (
            id   serial
                constraint modes_pk
                    primary key,
            name varchar not null
        );
        
        alter table inventory.modes
            owner to postgres;
        
        create unique index modes_name_uindex
            on inventory.modes (name);
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table inventory.modes;`);
  }
}
