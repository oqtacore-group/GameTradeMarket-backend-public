import { MigrationInterface, QueryRunner } from 'typeorm';

export class Slides1664570868764 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
          create table inventory.slides
          (
              id        serial
                  constraint slides_pk
                      primary key,
              image_url varchar not null,
              title     varchar not null,
              subtitle  varchar,
              meta      jsonb default '{}'::jsonb
          );

          alter table inventory.slides
              owner to postgres;
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table inventory.slides;`);
  }
}
