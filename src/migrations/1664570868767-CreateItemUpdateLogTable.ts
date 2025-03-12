import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateItemUpdateLogTable1664570868767
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            create table inventory.item_update_log (
                id serial,
                item_id integer not null,
                created_at timestamp not null,
                game_code varchar not null,
                action varchar not null,
                token_value text not null,
                contract varchar not null
            );

            alter table inventory.item_update_log
            owner to postgres;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table inventory.item_update_log`);
  }
}
