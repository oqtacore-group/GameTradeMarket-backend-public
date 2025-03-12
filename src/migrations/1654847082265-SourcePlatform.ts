import { MigrationInterface, QueryRunner } from 'typeorm';

export class SourcePlatform1654847082265 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      create table inventory.source_platforms
        (
            id          serial
                constraint source_platforms_pk
                    primary key,
            platform_id integer not null
                constraint source_platforms_platforms_id_fk
                    references inventory.platforms
                    on update cascade on delete restrict,
            game_code   varchar not null
                constraint source_platforms_sources_code_fk
                    references inventory.sources
                    on update cascade on delete restrict
        );
        
        alter table inventory.source_platforms
            owner to postgres;
        
        create unique index source_platforms_game_code_platform_id_uindex
            on inventory.source_platforms (game_code, platform_id);
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table inventory.source_modes;`);
  }
}
