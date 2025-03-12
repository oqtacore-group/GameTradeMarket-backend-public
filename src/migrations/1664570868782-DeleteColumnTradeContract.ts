import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class DeleteColumnTradeContract1664570868782 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('inventory.source_currencies', 'trade_contract_address');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'inventory.source_currencies',
            new TableColumn({
                name: 'trade_contract_address',
                type: 'varchar',
                isNullable: false,
            }),
        );
    }
}
