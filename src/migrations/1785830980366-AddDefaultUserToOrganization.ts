import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultUserToOrganization1785830980366 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`organization\`
                ADD \`default_user_id\` INT NULL
                AFTER \`platform_purpose\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`organization\`
                ADD CONSTRAINT \`FK_organization_default_user\`
                FOREIGN KEY (\`default_user_id\`) REFERENCES \`users\`(\`id\`)
                ON DELETE SET NULL
        `);
        await queryRunner.query(`
            UPDATE \`organization\` o
            SET o.default_user_id = (
                SELECT u.id FROM \`users\` u
                WHERE u.organization_id = o.id AND u.role_id = 2
                ORDER BY u.created_at ASC LIMIT 1
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`organization\`
                DROP FOREIGN KEY \`FK_organization_default_user\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`organization\`
                DROP COLUMN \`default_user_id\`
        `);
    }

}
