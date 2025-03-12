import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class RenameColumnTxDataToData1664570868783 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('inventory.items', 'tx_data');
        await queryRunner.addColumn('inventory.items', 
            new TableColumn({
                name: 'item_data',
                type: 'jsonb',
                isNullable: true,
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('inventory.items', 
            new TableColumn({
                name: 'tx_data',
                type: 'varchar',
                isNullable: true,
            })
        )
        await queryRunner.dropColumn('inventory.items', 'item_data')
    }
}
