import { MigrationInterface, QueryRunner } from 'typeorm';

export class SourceMode1654847082262 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      create table inventory.source_modes
        (
            id        serial
                constraint source_modes_pk
                    primary key,
            mode_id   integer not null
                constraint source_modes_modes_id_fk
                    references inventory.modes
                    on update cascade on delete restrict,
            game_code varchar not null
                constraint source_modes_sources_code_fk
                    references inventory.sources
                    on update cascade on delete restrict
        );
        
        alter table inventory.source_modes
            owner to postgres;
        
        create unique index source_modes_game_code_mode_id_uindex
            on inventory.source_modes (game_code, mode_id);
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table inventory.source_modes;`);
  }
}
