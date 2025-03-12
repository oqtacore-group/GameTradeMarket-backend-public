import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class UpdatePriceColumnType1664570868779 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('inventory.coin_info', 'price');
        await queryRunner.addColumn(
            'inventory.coin_info',
            new TableColumn({
                name: 'price',
                type: 'float',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('inventory.coin_info', 'price');
        await queryRunner.addColumn(
            'inventory.coin_info',
            new TableColumn({
                name: 'price',
                type: 'integer',
                isNullable: true,
            }),
        );
    }
}
