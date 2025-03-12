import { MigrationInterface, QueryRunner } from 'typeorm';

export class Reviews1654847082266 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `create table inventory.reviews
          (
              id          serial
                  constraint reviews_pk
                      primary key,
              user_id     uuid                    not null
                  constraint reviews_users_id_fk
                      references account.users
                      on update cascade on delete restrict,
              rating      integer,
              description varchar(4000),
              create_time timestamp default now() not null,
              game_code   varchar                 not null
                  constraint reviews_sources_code_fk
                      references inventory.sources
                      on update cascade on delete restrict
          );
          
          alter table inventory.reviews
              owner to postgres;
        `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table inventory.reviews`);
  }
}
