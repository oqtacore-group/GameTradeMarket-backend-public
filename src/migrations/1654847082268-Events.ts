import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class Events1654847082268 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'account.users',
      new TableColumn({
        name: 'bonuses',
        type: 'numeric',
        default: 0,
      }),
    );
    await queryRunner.query(`
      create table inventory.actions_types
        (
            id          serial
                constraint actions_types_pk
                    primary key,
            name        varchar                 not null,
            "limit"       int   default 1     not null,
            is_public   boolean   default false not null,
            is_required boolean   default false not null,
            amount      int   default 1     not null,
            created_at  timestamp default now() not null
        );
        
        alter table inventory.actions_types
            owner to postgres;
        
        create unique index actions_types_name_uindex
            on inventory.actions_types (name);
    `);
    await queryRunner.query(`
      create table account.user_actions
        (
            id         serial
                constraint user_actions_pk
                    primary key,
            action_id  integer                 not null
                constraint user_actions_actions_types_id_fk
                    references inventory.actions_types
                    on update cascade on delete restrict,
            user_id    uuid                    not null
                constraint user_actions_users_id_fk
                    references account.users
                    on update cascade on delete restrict,
            extra      jsonb,
            created_at timestamp default now() not null
        );
        
        alter table account.user_actions
            owner to postgres;
    `);
    await queryRunner.query(`
      create table admin.action_transactions
        (
            id         serial
                constraint action_transactions_pk
                    primary key,
            action_id  integer                 not null,
            user_id    uuid,
            type       varchar                 not null,
            amount     numeric,
            balance    numeric,
            created_at timestamp default now() not null
        );
        
        alter table admin.action_transactions
            owner to postgres;
    `);
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION add_bonuses()
         RETURNS TRIGGER 
         LANGUAGE PLPGSQL
      AS $$
      BEGIN
          if (new.type = 'credit') then
              update account.users set bonuses = bonuses + new.amount where id = new.user_id;
          end if;
          if (new.type = 'debit') then
              update account.users set bonuses = bonuses - new.amount where id = new.user_id;
          end if;
      
          return new;
      END;
      $$
    `);
    await queryRunner.query(`
      CREATE TRIGGER add_bonuses_users
      BEFORE INSERT
      ON admin.action_transactions
      FOR EACH ROW
      EXECUTE PROCEDURE add_bonuses();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('account.users', 'bonuses');
    await queryRunner.query(`drop trigger add_bonuses_users`);
    await queryRunner.query(`drop function add_bonuses;`);
    await queryRunner.dropTable('account.user_actions');
    await queryRunner.dropTable('inventory.actions_types');
    await queryRunner.dropTable('admin.action_transactions');
  }
}
