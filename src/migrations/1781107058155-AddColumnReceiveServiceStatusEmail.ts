import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnReceiveServiceStatusEmail1781107058155 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\`
                ADD \`receive_service_status_emails\` BOOLEAN NOT NULL DEFAULT TRUE
                AFTER \`organization_id\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\`
                DROP COLUMN \`receive_service_status_emails\`
        `);
    }

}