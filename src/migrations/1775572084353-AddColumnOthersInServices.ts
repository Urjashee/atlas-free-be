import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnOthersInServices1775572084353 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`service_details\`
                ADD \`medication_others\` LONGTEXT NULL AFTER \`user_id\`,
                ADD \`mental_health_diagnoses_others\` LONGTEXT NULL AFTER \`medication_others\`;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
