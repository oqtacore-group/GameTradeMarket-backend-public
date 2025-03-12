import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class AddColumnToCoinInfo1664570868781 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'inventory.coin_info',
            new TableColumn({
                name: 'update_time',
                type: 'timestamp',
                default: 'now()',
                isNullable: false,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(
            'inventory.coin_info',
            new TableColumn({
                name: 'update_time',
                type: 'timestamp',
                default: 'now()',
                isNullable: false,
            }),
        );
    }
}
