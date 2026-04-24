import AppDataSource from "../../ormconfig";
import { Users } from "../entity/Users.entity";
import { Organization } from "../entity/Organization.entity";
import { ServiceDetails } from "../entity/ServiceDetails.entity";
import { AssignedServices } from "../entity/AssignedServices.entity";
import { EmailReminder } from "../entity/EmailReminder.entity";
import { ReportService } from "../entity/ReportService.entity";
import { ReportUser } from "../entity/ReportUser";
import { ClientService } from "../entity/ClientService.entity";
import { Affiliations } from "../entity/Affiliations.entity";
import { PasswordReset } from "../entity/PasswordReset.entity";
import { DeviceToken } from "../entity/DeviceToken.entity";

export class DeleteOrganizationService {
    private organizationRepository = AppDataSource.getRepository(Organization);
    private userRepository = AppDataSource.getRepository(Users);
    private serviceDetailsRepository = AppDataSource.getRepository(ServiceDetails);
    private assignedServicesRepository = AppDataSource.getRepository(AssignedServices);
    private emailReminderRepository = AppDataSource.getRepository(EmailReminder);
    private reportServiceRepository = AppDataSource.getRepository(ReportService);
    private reportUserRepository = AppDataSource.getRepository(ReportUser);
    private clientServiceRepository = AppDataSource.getRepository(ClientService);
    private affiliationsRepository = AppDataSource.getRepository(Affiliations);
    private passwordResetRepository = AppDataSource.getRepository(PasswordReset);
    private deviceTokenRepository = AppDataSource.getRepository(DeviceToken);

    async organizationExists(organization_id: number): Promise<boolean> {
        const org = await this.organizationRepository.findOne({ where: { id: organization_id } });
        return !!org;
    }

    async deleteOrganization(organization_id: number): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Collect IDs needed for child table deletes
            const serviceIds: number[] = (await AppDataSource.query(
                `SELECT id FROM service_details WHERE organization_id = ?`, [organization_id]
            )).map((r: any) => r.id);

            const clientIds: number[] = (await AppDataSource.query(
                `SELECT id FROM client_service WHERE organization_id = ?`, [organization_id]
            )).map((r: any) => r.id);

            const userIds: number[] = (await AppDataSource.query(
                `SELECT id FROM users WHERE organization_id = ?`, [organization_id]
            )).map((r: any) => r.id);

            // 1. assigned_services — references service_id, client_service_id, user_id
            if (serviceIds.length) {
                await queryRunner.manager.createQueryBuilder()
                    .delete().from(AssignedServices)
                    .where("service_id IN (:...serviceIds)", { serviceIds })
                    .execute();
            }
            if (clientIds.length) {
                await queryRunner.manager.createQueryBuilder()
                    .delete().from(AssignedServices)
                    .where("client_service_id IN (:...clientIds)", { clientIds })
                    .execute();
            }
            if (userIds.length) {
                await queryRunner.manager.createQueryBuilder()
                    .delete().from(AssignedServices)
                    .where("user_id IN (:...userIds)", { userIds })
                    .execute();
            }

            // 2. email_reminder — references service_id
            if (serviceIds.length) {
                await queryRunner.manager.createQueryBuilder()
                    .delete().from(EmailReminder)
                    .where("service_id IN (:...serviceIds)", { serviceIds })
                    .execute();
            }

            // 3. report_service — references service_id, user_id, organization_id
            await queryRunner.manager.createQueryBuilder()
                .delete().from(ReportService)
                .where("organization_id = :organization_id", { organization_id })
                .execute();

            // 4. report_user — references reported_client_id (client_service), reported_user_id/reported_by_id (users), organization_id
            if (clientIds.length) {
                await queryRunner.manager.createQueryBuilder()
                    .delete().from(ReportUser)
                    .where("reported_client_id IN (:...clientIds)", { clientIds })
                    .execute();
            }
            if (userIds.length) {
                await queryRunner.manager.createQueryBuilder()
                    .delete().from(ReportUser)
                    .where("reported_user_id IN (:...userIds)", { userIds })
                    .execute();
                await queryRunner.manager.createQueryBuilder()
                    .delete().from(ReportUser)
                    .where("reported_by_id IN (:...userIds)", { userIds })
                    .execute();
            }
            await queryRunner.manager.createQueryBuilder()
                .delete().from(ReportUser)
                .where("organization_id = :organization_id", { organization_id })
                .execute();

            // 5. client_service — references organization_id, user_id (user/client columns)
            if (clientIds.length) {
                await queryRunner.manager.createQueryBuilder()
                    .delete().from(ClientService)
                    .where("id IN (:...clientIds)", { clientIds })
                    .execute();
            }

            // 6. affiliations — references organization_id
            await queryRunner.manager.createQueryBuilder()
                .delete().from(Affiliations)
                .where("organization_id = :organization_id", { organization_id })
                .execute();

            // 7. service_details — has user_id FK referencing users, must be deleted before users
            if (serviceIds.length) {
                await queryRunner.manager.createQueryBuilder()
                    .delete().from(ServiceDetails)
                    .where("id IN (:...serviceIds)", { serviceIds })
                    .execute();
            }

            // 8. password_reset, device_token, then users
            if (userIds.length) {
                await queryRunner.manager.createQueryBuilder()
                    .delete().from(PasswordReset)
                    .where("user_id IN (:...userIds)", { userIds })
                    .execute();
                // DeviceToken uses @JoinColumn() with no name — TypeORM generates column "userId"
                await queryRunner.query(
                    `DELETE FROM device_token WHERE userId IN (${userIds.map(() => '?').join(',')})`,
                    userIds
                );
                await queryRunner.manager.createQueryBuilder()
                    .delete().from(Users)
                    .where("id IN (:...userIds)", { userIds })
                    .execute();
            }

            // 9. organization
            await queryRunner.manager.createQueryBuilder()
                .delete().from(Organization)
                .where("id = :organization_id", { organization_id })
                .execute();

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}