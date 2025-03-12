import { MigrationInterface, QueryRunner } from 'typeorm';

export class SourceCurrencies1664570868763 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
          create table inventory.source_currencies
            (
                id        serial
                    constraint source_currencies_pk
                        primary key,
                game_code varchar not null
                    constraint source_currencies_sources_code_fk
                        references inventory.sources
                        on update cascade on delete restrict,
                blockchain_code varchar not null
                    constraint blockchain_code_blockchain_code_fk
                        references blockchain.networks
                        on update cascade on delete restrict,
                coin_name    varchar                 not null,
                contract_address    varchar                 not null,
                trade_contract_address varchar,
                decimals    integer                 not null,
                logo    text,
                hidden boolean   default false,
                created_at    timestamp default now() not null,
                gecko_id varchar,
                price real
            );
            
            alter table inventory.source_currencies
                owner to postgres;
          `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table inventory.source_genres;`);
  }
}
