import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeColumnType1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE organization 
            MODIFY ein VARCHAR(255);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE organization 
            MODIFY ein INT;
        `);
    }
}
