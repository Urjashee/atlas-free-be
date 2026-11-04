import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeFaithEngagementPracticeToText1790676457791 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`service_details\`
            MODIFY \`faith_engagement_practice\` TEXT NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`service_details\`
            MODIFY \`faith_engagement_practice\` VARCHAR(255) NULL;
        `);
    }
}
