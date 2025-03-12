import { MigrationInterface, QueryRunner } from 'typeorm';

export class InventoryCommentLike1647326239081 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table inventory.item_comment_likes
        (
            id         serial
                constraint item_comment_likes_pk
                    primary key,
            comment_id integer not null
                constraint item_comment_likes_item_comments_id_fk
                    references inventory.item_comments
                    on update cascade on delete restrict,
            user_id    uuid    not null
                constraint item_comment_likes_users_id_fk
                    references account.users
                    on update cascade on delete restrict
        );
        
        alter table inventory.item_comment_likes
            owner to postgres;
        
        create unique index item_comment_likes_comment_id_user_id_uindex
            on inventory.item_comment_likes (comment_id, user_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table inventory.item_comment_likes`);
  }
}
