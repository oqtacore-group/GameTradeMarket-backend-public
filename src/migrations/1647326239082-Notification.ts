import { MigrationInterface, QueryRunner } from 'typeorm';

export class Notification1647326239082 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table account.notifications
          (
              id          serial
                  constraint notifications_pk
                      primary key,
              title       varchar                 not null,
              type        varchar                 not null,
              body        text                    not null,
              create_time timestamp default now() not null,
              user_id     uuid                    not null
                  constraint notifications_users_id_fk
                      references account.users
                      on update cascade on delete restrict
          );
          
          alter table account.notifications owner to postgres;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table account.notifications`);
  }
}
