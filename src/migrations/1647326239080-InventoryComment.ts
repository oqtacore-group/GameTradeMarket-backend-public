import { MigrationInterface, QueryRunner } from 'typeorm';

export class InventoryComment1647326239080 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table inventory.item_comments
        (
            id          serial
                constraint item_comments_pk
                    primary key,
            message     text                                   not null,
            item_id     integer                                not null
                constraint item_comments_items_id_fk
                    references inventory.items
                    on update cascade on delete restrict,
            user_id     uuid                                   not null
                constraint item_comments_users_id_fk
                    references account.users
                    on update cascade on delete restrict,
            create_time timestamp with time zone default now() not null
        );
        
        alter table inventory.item_comments
            owner to postgres;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table inventory.item_comments`);
  }
}
