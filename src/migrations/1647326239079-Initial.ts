import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1647326239079 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create schema account;
      
      create schema admin;
      
      create schema blockchain;
      
      create schema inventory;
      
      create schema roles;
      
      create schema tokens;
      
      create type account.wallet_provider as enum ('metamask', 'walletConnect');
      
      alter type account.wallet_provider owner to postgres;
      
      create table roles.roles
      (
          code        text                                   not null
              constraint "PK_f6d54f95c31b73fb1bdd8e91d0c"
                  primary key,
          name        varchar(128)                           not null,
          create_time timestamp with time zone default now() not null,
          update_time timestamp with time zone default now() not null
      );
      
      alter table roles.roles
          owner to postgres;
      
      create table roles.profiles
      (
          id          serial
              constraint "PK_8e520eb4da7dc01d0e190447c8e"
                  primary key,
          code        text                                   not null
              constraint "FK_e51b32f90e7562cd9d86bc30135"
                  references roles.roles,
          path        ltree                                  not null,
          create_time timestamp with time zone default now() not null
      );
      
      alter table roles.profiles
          owner to postgres;
      
      create table account.users
      (
          id                  uuid                     default uuid_generate_v4() not null
              constraint "PK_a3ffb1c0c8416b9fc6f907b7433"
                  primary key,
          bio                 text,
          create_time         timestamp with time zone default now()              not null,
          custom_url          text
              constraint "UQ_4ee94e6094f0f817baabaaa9cb7"
                  unique,
          email               varchar(64)                                         not null
              constraint "UQ_97672ac88f789774dd47f7c8be3"
                  unique,
          email_verified      boolean                  default false              not null,
          google_sub          text
              constraint "UQ_68b61ba0fb359b93b517cf1073d"
                  unique,
          image_url           text,
          last_visited        timestamp with time zone,
          locale              char(2)                  default 'en'::bpchar       not null,
          mail_code           integer,
          mail_code_tries     integer                  default 0                  not null,
          nick_name           varchar(32),
          online_time         timestamp with time zone default now()              not null,
          password            varchar(60),
          password_code       integer,
          password_code_tries integer                  default 0                  not null,
          social              jsonb                    default '[]'::jsonb,
          update_time         timestamp with time zone default now()              not null,
          version             uuid                     default uuid_generate_v4() not null,
          referer             varchar
      );
      
      alter table account.users
          owner to postgres;
      
      create table account.user_wallets
      (
          id          serial
              constraint "PK_f98089275dcfc65d59b1d347167"
                  primary key,
          user_id     uuid                                   not null
              constraint "FK_7382818ff309cabe40c7a74237a"
                  references account.users
                  on update cascade on delete restrict,
          name        text                                   not null,
          address     varchar                                not null
              constraint "UQ_c7a63e906aaba520487362a44d7"
                  unique,
          provider    account.wallet_provider                not null,
          create_time timestamp with time zone default now() not null,
          update_time timestamp with time zone default now() not null
      );
      
      alter table account.user_wallets
          owner to postgres;
      
      create table account.user_roles
      (
          id      serial
              constraint "PK_8acd5cf26ebd158416f477de799"
                  primary key,
          user_id uuid not null
              constraint "FK_87b8888186ca9769c960e926870"
                  references account.users
                  on update cascade on delete restrict,
          code    text not null
              constraint "FK_2d49ef9790dc2bcf1722d28d0ab"
                  references roles.roles
                  on update cascade on delete restrict
      );
      
      alter table account.user_roles
          owner to postgres;
      
      create unique index "IDX_bb97814b7f4828642a608a920a"
          on account.user_roles (user_id, code);
      
      create table account.user_sessions
      (
          id          serial
              constraint "PK_e93e031a5fed190d4789b6bfd83"
                  primary key,
          user_id     uuid                                   not null
              constraint "FK_e9658e959c490b0a634dfc54783"
                  references account.users
                  on update cascade on delete cascade,
          token       text                                   not null,
          create_time timestamp with time zone default now() not null
      );
      
      alter table account.user_sessions
          owner to postgres;
      
      create table blockchain.networks
      (
          code           varchar              not null
              constraint "PK_f820172634ddbb5fd48463cb718"
                  primary key,
          currency       text                 not null,
          is_enabled     boolean default true not null,
          name           text                 not null,
          rpc_url        text                 not null,
          external_url   varchar,
          trade_contract text
      );
      
      alter table blockchain.networks
          owner to postgres;
      
      create table tokens.balances
      (
          contract   varchar not null
              constraint "PK_728db767defe393f4b8ad55c4e9"
                  primary key,
          name       text    not null,
          currency   text    not null,
          blockchain varchar not null
              constraint "FK_6784f7b6a92d5343ff47b0fb1af"
                  references blockchain.networks
                  on update cascade on delete restrict
      );
      
      alter table tokens.balances
          owner to postgres;
      
      create table inventory.sources
      (
          code        varchar                   not null
              constraint "PK_fbcaa228d0b384ae42c2d06ab3d"
                  primary key,
          publisher   text                      not null,
          name        varchar                   not null,
          developer   text                      not null,
          public_date date                      not null,
          picture_url text,
          media_urls  jsonb default '[]'::jsonb not null,
          social_urls jsonb default '[]'::jsonb not null,
          is_free_to_play bool default false    not null,
          state       varchar                   not null,
          owner_id    uuid                      not null
              constraint "FK_39a32928b5c6b686d5ac3ff3e89"
                  references account.users
                  on update cascade on delete restrict,
          rating          integer,
          external_link   text,
          app_links       jsonb   default '[]'::jsonb not null,
          release_date    varchar,
          social_links    jsonb,
          media_links     jsonb   default '[]'::jsonb not null,
          description     text,
          is_verify     boolean default false not null,
          logo     text,
          is_nft_required     boolean default false not null,
          is_crypto_required     boolean default false not null,
          is_game_required     boolean default false not null,
          is_play_to_earn_nft     boolean default false not null,
          is_play_to_earn_crypto     boolean default false not null,
          hidden     boolean default false not null,
          update_time     timestamptz
      );
      
      alter table inventory.sources
          owner to postgres;
      
      create table inventory.contracts
      (
          contract    varchar                                            not null
              constraint "PK_4fe54df9c2f40619c022a7a3c21"
                  primary key,
          game_code   varchar                                            not null
              constraint "FK_c422918c2c9716d158b997de6a1"
                  references inventory.sources
                  on update cascade on delete restrict,
          mapping     jsonb                    default '{}'::jsonb       not null,
          blockchain  varchar                                            not null
              constraint "FK_2c598f9d3f319f1ebb2da054c48"
                  references blockchain.networks,
          is_test     boolean                  default false             not null,
          create_time timestamp with time zone default now()             not null,
          update_time timestamp with time zone default now()             not null,
          platform    text                     default 'GAMETRADE'::text not null
      );
      
      alter table inventory.contracts
          owner to postgres;
      
      create table inventory.items
      (
          id          serial
              constraint "PK_ba5885359424c15ca6b9e79bcf6"
                  primary key,
          token_value text                                         not null,
          contract    varchar                                      not null
              constraint "FK_c6bc9343a95b8e3a8f324ab9c89"
                  references inventory.contracts,
          wallet      varchar                                      not null,
          token_uri   text                                         not null,
          trade_contract text,
          attributes  jsonb                    default '{}'::jsonb not null,
          picture_url varchar,
          sale_type   text                                         not null,
          need_update boolean                  default false       not null,
          approved    boolean                  default false       not null,
          create_time timestamp with time zone default now()       not null,
          update_time timestamp with time zone default now()       not null,
          price       numeric                  default 0           not null,
          fee         numeric                  default 0           not null,
          coin_address varchar                 default '0x0000000000000000000000000000000000000000'           not null,
          coin_price  real,
          platform    varchar
      );
      
      alter table inventory.items
          owner to postgres;
      
      create unique index "IDX_c0b6831953e71873e6aa49e6c4"
          on inventory.items (token_value, contract);
          
      CREATE OR REPLACE FUNCTION save_item_price_change_to_listings() RETURNS TRIGGER AS $$
      DECLARE
        user_id_saved uuid;
        wallet_saved character varying;
      BEGIN
        -- Save user_id that owns wallet for the moment of making record in DB
        SELECT user_id INTO user_id_saved
          FROM account.user_wallets AS uw
          WHERE uw.address = NEW.wallet;

        -- If this is NOT FIRST wallet's listing
        IF EXISTS (SELECT FROM inventory.listings WHERE item_id = NEW.id) THEN
          -- If price changed
          IF (NEW.price != OLD.price) THEN
            -- Save changed wallet to variable
            SELECT wallet INTO wallet_saved
              FROM inventory.listings
              WHERE item_id = NEW.id
              ORDER BY create_time DESC
              LIMIT 1;

            -- If wallet differs
            IF (NEW.wallet != wallet_saved) THEN
              INSERT INTO inventory.listings (item_id, price_prev, price_current, user_id, wallet, is_listing)
                VALUES (NEW.id, OLD.price, NEW.price, user_id_saved, NEW.wallet, true);

            -- If wallet the same
            ELSE
              INSERT INTO inventory.listings (item_id, price_prev, price_current, user_id, wallet, is_listing)
                VALUES (NEW.id, OLD.price, NEW.price, user_id_saved, NEW.wallet, false);
            END If;
          END IF;

        -- If FIRST wallet listing
        ELSE
          INSERT INTO inventory.listings (item_id, price_prev, price_current, user_id, wallet, is_listing)
            VALUES (NEW.id, NULL, NEW.price, user_id_saved, NEW.wallet, true);
        END IF;

        RETURN NULL;
      END
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER tr_save_item_price_change_to_listings
      AFTER UPDATE OF price ON inventory.items
      FOR EACH ROW EXECUTE PROCEDURE save_item_price_change_to_listings();    

      create table account.friends
      (
          id          serial
              constraint "PK_65e1b06a9f379ee5255054021e1"
                  primary key,
          owner       uuid                    not null
              constraint "FK_f8bdb26438c69106d58635a26d1"
                  references account.users
                  on update cascade on delete restrict,
          friend      uuid                    not null
              constraint "FK_10390c9cb4aa6c2364a35eb1ef2"
                  references account.users
                  on update cascade on delete restrict,
          create_time timestamp default now() not null
      );
      
      alter table account.friends
          owner to postgres;
      
      create unique index "IDX_e2acdc6c90aacdb8929d0cc71b"
          on account.friends (owner, friend);
      
      create table account.friend_requests
      (
          id          serial
              constraint "PK_3827ba86ce64ecb4b90c92eeea6"
                  primary key,
          recipient   uuid                    not null
              constraint "FK_dd6559376447942b1a8df9d3410"
                  references account.users
                  on update cascade on delete restrict,
          sender      uuid                    not null
              constraint "FK_b6857932571227337d136a283df"
                  references account.users
                  on update cascade on delete restrict,
          create_time timestamp default now() not null
      );
      
      alter table account.friend_requests
          owner to postgres;
      
      create table account.writes
      (
          id          serial
              constraint "PK_851601b23e0da3471b28a5e7e6c"
                  primary key,
          email       text                                   not null,
          name        text                                   not null,
          body        text                                   not null,
          create_time timestamp with time zone default now() not null
      );
      
      alter table account.writes
          owner to postgres;
      
      create table account.user_subscriptions
      (
          email       text                                   not null
              constraint "PK_ce1bbe4bd8542d62f2a1bf9647d"
                  primary key,
          create_time timestamp with time zone default now() not null
      );
      
      alter table account.user_subscriptions
          owner to postgres;
      
      create table roles.resources
      (
          code        ltree                                  not null
              constraint "PK_b7ab912cd81e4b447e43d45e382"
                  primary key,
          name        varchar(128)                           not null,
          create_time timestamp with time zone default now() not null,
          update_time timestamp with time zone default now() not null
      );
      
      alter table roles.resources
          owner to postgres;
      
      create table account.user_messages
      (
          id           serial
              constraint "PK_5a90e206d5e3dfde48f640ea7c6"
                  primary key,
          sender_id    uuid                                                                            not null
              constraint "FK_74adf60fffd02e8c754b882b1d3"
                  references account.users
                  on update cascade on delete restrict,
          recipient_id uuid                                                                            not null
              constraint "FK_c16aa4bc5db6b57414984cfbb05"
                  references account.users
                  on update cascade on delete restrict,
          context      text not null,
          is_media     boolean                  default false                                          not null,
          meta_data    jsonb                    default '{"key": "", "etag": "", "bucket": ""}'::jsonb not null,
          create_time  timestamp with time zone default now()                                          not null,
          is_read      boolean                  default false                                          not null
      );
      
      alter table account.user_messages
          owner to postgres;
      
      create table inventory.source_users
      (
          id      serial
              constraint "PK_c6983da838305c150c93aec6e66"
                  primary key,
          code    varchar not null
              constraint "FK_56f9903201b2a2419766932751d"
                  references inventory.sources
                  on update cascade on delete restrict,
          user_id uuid    not null
              constraint "FK_5ea2489d0615f86a4008b885a61"
                  references account.users
                  on update cascade on delete restrict
      );
      
      alter table inventory.source_users
          owner to postgres;
      
      create unique index "IDX_436053eca990b2579d021afe6d"
          on inventory.source_users (code, user_id);
      
      create table inventory.item_likes
      (
          id      serial
              constraint item_likes_pk
                  primary key,
          item_id integer not null
              constraint "FK_da80574eb154bb6901d924da82d"
                  references inventory.items
                  on update cascade on delete restrict,
          user_id uuid    not null
              constraint "FK_c51f3d6ee230f00c0f652329628"
                  references account.users
                  on update cascade on delete restrict
      );
      
      alter table inventory.item_likes
          owner to postgres;
      
      create unique index "IDX_31378e5c84800283f19e54060a"
          on inventory.item_likes (item_id, user_id);
      
      create table admin.access_keys
      (
          id          serial
              constraint "PK_acdb83140f2654f870d92236303"
                  primary key,
          api_key     varchar                 not null
              constraint "UQ_201f9f19143d9a6d3b93767d060"
                  unique,
          create_time timestamp default now() not null,
          user_id     uuid                    not null
              constraint "FK_9ad6c236dae9cfdaf7dd086ff5d"
                  references account.users
                  on update cascade on delete cascade
      );
      
      alter table admin.access_keys
          owner to postgres;
      
      create table inventory.listings
      (
          id            serial
              constraint "PK_520ecac6c99ec90bcf5a603cdcb"
                  primary key,
          item_id       integer                                not null
              constraint "FK_f106de8506964e3216fbf5c61a3"
                  references inventory.items,
          user_id       uuid,
          wallet        varchar                                not null,
          price_prev    numeric,
          price_current numeric                                not null,
          is_listing    boolean                  default false not null,
          create_time   timestamp with time zone default now() not null
      );
      
      alter table inventory.listings
          owner to postgres;
          
      create table inventory.item_transactions
      (
          id         serial
              constraint item_transactions_pk
                  primary key,
          item_id    integer                 not null,
          seller_uid uuid                    not null,
          buyer_uid  uuid                    not null,
          created_at timestamp default now() not null,
          price      real                    not null
      );
      
      alter table inventory.item_transactions
          owner to postgres;

      create function save_item_transactions() returns trigger
          language plpgsql
      as
      $$
      DECLARE
        seller_uid uuid;
        buyer_uid uuid;
      BEGIN
          IF old.approved IS TRUE AND new.approved IS FALSE THEN
              SELECT user_id INTO seller_uid
              FROM account.user_wallets
              WHERE address = old.wallet;
      
              SELECT user_id INTO buyer_uid
              FROM account.user_wallets
              WHERE address = new.wallet;
      
              INSERT INTO inventory.item_transactions (item_id, seller_uid, buyer_uid, price)
              VALUES (old.id, seller_uid, buyer_uid, old.price);
          END IF;
      
          RETURN new;
      END
      $$;
      
      alter function save_item_transactions() owner to postgres;    
          
      create trigger tr_save_item_transactions
      after update
          of approved
      on inventory.items
      for each row
      execute procedure public.save_item_transactions();  
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table inventory.listings`);
    await queryRunner.query(`drop table admin.access_keys`);
    await queryRunner.query(`drop table inventory.item_likes`);
    await queryRunner.query(`drop table inventory.source_users`);
    await queryRunner.query(`drop table account.user_messages`);
    await queryRunner.query(`drop table roles.resources`);
    await queryRunner.query(`drop table account.user_subscriptions`);
    await queryRunner.query(`drop table account.writes`);
    await queryRunner.query(`drop table account.friend_requests`);
    await queryRunner.query(`drop table account.friends`);
    await queryRunner.query(`
      drop trigger tr_save_item_price_change_to_listings on inventory.items 
    `);
    await queryRunner.query(`
      drop function save_item_price_change_to_listings
    `);
    await queryRunner.query(`drop table inventory.items`);
    await queryRunner.query(`drop table inventory.contracts`);
    await queryRunner.query(`drop table inventory.sources`);
    await queryRunner.query(`drop table tokens.balances`);
    await queryRunner.query(`drop table blockchain.networks`);
    await queryRunner.query(`drop table account.user_sessions`);
    await queryRunner.query(`drop table account.user_roles`);
    await queryRunner.query(`drop table account.user_wallets`);
    await queryRunner.query(`drop table account.users`);
    await queryRunner.query(`drop table roles.profiles`);
    await queryRunner.query(`drop table roles.roles`);
    await queryRunner.query(`drop type account.wallet_provider`);
    await queryRunner.query(`drop schema account`);
    await queryRunner.query(`drop schema admin`);
    await queryRunner.query(`drop schema blockchain`);
    await queryRunner.query(`drop schema inventory`);
    await queryRunner.query(`drop schema roles`);
    await queryRunner.query(`drop schema tokens`);
  }
}
