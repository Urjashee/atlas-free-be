import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeDobColumnTypeToDate1781768430996 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE client_service
            MODIFY dob DATE NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE client_service
            MODIFY dob TIMESTAMP NULL;
        `);
    }
}