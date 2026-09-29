import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableServiceRequestStatusHistory1790676457790 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "service_request_status_history",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "assigned_service_id",
                        type: "int",
                    },
                    {
                        name: "status",
                        type: "int",
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["assigned_service_id"],
                        referencedTableName: "assigned_services",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                        onUpdate: "CASCADE",
                    },
                ],
                indices: [
                    {
                        columnNames: ["status", "created_at"],
                    },
                ],
            }),
            true
        );

        await queryRunner.query(
            `INSERT INTO service_request_status_history (assigned_service_id, status, created_at)
             SELECT id, status, created_at FROM assigned_services`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("service_request_status_history");
    }
}
