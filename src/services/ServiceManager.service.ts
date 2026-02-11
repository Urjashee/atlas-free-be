import AppDataSource from "../../ormconfig";
import {ServiceDetails} from "../entity/ServiceDetails.entity";
import {Like, Raw} from "typeorm";
import {AssignedServices, ClientStatus} from "../entity/AssignedServices.entity";
import {EmailReminder} from "../entity/EmailReminder.entity";

export class ServiceManagerService {
    private serviceDetailsRepository = AppDataSource.getRepository(ServiceDetails);
    private assignedServiceRepository = AppDataSource.getRepository(AssignedServices);
    private emailReminderRepository = AppDataSource.getRepository(EmailReminder);

    async checkIfService(service_id: number) {
        return await this.serviceDetailsRepository.findOne({
            where: {
                id: service_id,
            }
        })
    }

    async checkIfValidService(service_id: number, organization_id: number, user_id: number) {
        console.log("Checking if valid user", user_id)
        console.log("Checking if valid service", service_id)
        return await this.serviceDetailsRepository.findOne({
            where: {
                id: service_id,
                service_manager: Raw(alias => `FIND_IN_SET(:user_id, ${alias}) > 0`, { user_id })
            }
        })
    }
    async getServiceManagerService(user_id: number) {
        return await this.serviceDetailsRepository.find({
            where: {
                service_manager: Raw(alias => `FIND_IN_SET(:user_id, ${alias}) > 0`, { user_id })
            },
            relations: ['organization', 'state'],
        })
    }
    async getServiceManagerServiceById(id: number, user_id: number) {
        return await this.serviceDetailsRepository.findOne({
            where: {
                id,
            },
            relations: ['organization', 'state'],
        })
    }

    async getServiceRequests(
        user_id: number,
        page_number = 1,
        page_size = 10,
        status?: number
    ) {
        const skip = (page_number - 1) * page_size;

        const qb = this.assignedServiceRepository
            .createQueryBuilder("as")
            .leftJoinAndSelect("as.organization", "organization")
            .leftJoinAndSelect("as.service", "service")
            .leftJoinAndSelect("service.state", "state")
            .leftJoinAndSelect("as.client_service", "client_service")
            .leftJoinAndSelect("as.user", "user")
            // .where(
            //     "FIND_IN_SET(:user_id, service.service_manager) > 0",
            //     { user_id }
            // )
            .orderBy("as.created_at", "DESC")
            .skip(skip)
            .take(page_size);

        if (typeof status === "number" && status !== ClientStatus.All) {
            qb.andWhere("as.status = :status", { status });
        }

        const [data, total] = await qb.getManyAndCount();

        return { data, total };
    }


    async editServiceSettings(body: any) {
        const serviceSetting = await this.serviceDetailsRepository.findOne({
            where: {
                id: body.service_id
            }
        })
        console.log(serviceSetting)
        if (serviceSetting) {
            serviceSetting.slots_available = body.available_slots;
            serviceSetting.contact_email = body.contact_email;
            serviceSetting.contact_phone = body.contact_phone;
            await this.serviceDetailsRepository.save(serviceSetting);
        } else {
            return false;
        }
        const existingReminders = await this.emailReminderRepository.find({
            where: {service: {id: body.service_id}},
        });

        const incoming = body.emailReminders || [];

        // Force all processedIds to be numbers
        const processedIds: number[] = [];

        for (const reminder of incoming) {
            if (reminder.id) {
                const reminderId = parseInt(reminder.id);

                // Check if this ID actually exists
                const existing = existingReminders.find(er => er.id === reminderId);
                if (existing) {
                    await this.emailReminderRepository.update(reminderId, {
                        email: reminder.email,
                        day_of_week: reminder.day_of_week,
                        time: reminder.time,
                        time_zone: reminder.time_zone,
                    });
                    processedIds.push(reminderId);
                } else {
                    console.warn(`Skipping update: reminder ID ${reminderId} not found.`);
                }
            } else {
                // Create new reminder
                const newReminder = this.emailReminderRepository.create({
                    service: {id: body.service_id},
                    email: reminder.email,
                    day_of_week: reminder.day_of_week,
                    time: reminder.time,
                    time_zone: reminder.time_zone,
                });
                const saved = await this.emailReminderRepository.save(newReminder);
                processedIds.push(saved.id);
            }
        }

        // Delete only those that are not in processed list
        for (const existing of existingReminders) {
            if (!processedIds.includes(existing.id)) {
                await this.emailReminderRepository.remove(existing);
            }
        }
        return serviceSetting;
    }
}
