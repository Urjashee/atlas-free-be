import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnPhysicalAccomodationOthers1775474786706 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`service_details\`
                ADD \`physical_accommodation_others\` LONGTEXT NULL AFTER \`user_id\`;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
