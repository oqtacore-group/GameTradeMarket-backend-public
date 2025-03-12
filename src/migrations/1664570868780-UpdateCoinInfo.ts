import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class UpdateCoinInfo1664570868780 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropPrimaryKey('inventory.coin_info.id');
        await queryRunner.query(`ALTER TABLE inventory.coin_info DROP CONSTRAINT "UQ_64f0b10f3a95170812ea7f4fdff"`);

        await queryRunner.query(`ALTER TABLE inventory.coin_info ADD CONSTRAINT "coin_info_id_key" UNIQUE ("id")`);
        
        await queryRunner.createPrimaryKey(
            new Table({
                name: 'coin_info',
                schema: 'inventory',
            }),
            ['blockchain', 'contract']
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropPrimaryKey('inventory.coin_info.blockchain');
        await queryRunner.dropPrimaryKey('inventory.coin_info.contract');

        await queryRunner.query(`ALTER TABLE inventory.coin_info ADD CONSTRAINT "UQ_64f0b10f3a95170812ea7f4fdff" UNIQUE ("symbol")`);
        await queryRunner.query(`ALTER TABLE inventory.coin_info DROP CONSTRAINT "coin_info_id_key"`);

        await queryRunner.createPrimaryKey(
            new Table({
                name: 'coin_info',
                schema: 'inventory',
            }),
            ['id'],
        );
    }
}
