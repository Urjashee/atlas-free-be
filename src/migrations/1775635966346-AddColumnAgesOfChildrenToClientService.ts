import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnAgesOfChildrenToClientService1775635966346 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`client_service\`
                ADD \`ages_of_children\` LONGTEXT NULL AFTER \`user_id\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
