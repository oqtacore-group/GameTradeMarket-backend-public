import { MigrationInterface, QueryRunner } from 'typeorm';

export class SourceGenre1654847082263 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      create table inventory.source_genres
        (
            id        serial
                constraint source_genres_pk
                    primary key,
            game_code varchar not null
                constraint source_genres_sources_code_fk
                    references inventory.sources
                    on update cascade on delete restrict,
            genre_code varchar not null
                constraint source_genres_genres_id_fk
                    references inventory.genres
                    on update cascade on delete restrict
        );
        
        alter table inventory.source_genres
            owner to postgres;
        
        create unique index source_genres_game_code_genre_id_uindex
            on inventory.source_genres (game_code, genre_code);
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table inventory.source_genres;`);
  }
}
