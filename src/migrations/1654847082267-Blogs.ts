import { MigrationInterface, QueryRunner } from 'typeorm';

export class Blogs1654847082267 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `create table inventory.blogs
                (
                    id            serial
                        constraint blogs_pk
                            primary key,
                    title         varchar                 not null,
                    sub_title     varchar,
                    img_url      text                    not null,
                    description   text,
                    create_time    timestamp default now() not null,
                    is_published boolean   default false,
                    user_id     uuid                    not null
                    constraint reviews_users_id_fk
                        references account.users
                        on update cascade on delete restrict,
                    game_code   varchar                 not null
                    constraint reviews_sources_code_fk
                        references inventory.sources
                        on update cascade on delete restrict
                );
                
                alter table inventory.blogs
                    owner to postgres;
        `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table inventory.blogs`);
  }
}
