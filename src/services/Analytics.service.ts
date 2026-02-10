import AppDataSource from "../../ormconfig";
import {Users} from "../entity/Users.entity";
import {Constants} from "../helper/Constants.helper";
import {randomBytes} from "crypto";
import {PasswordReset} from "../entity/PasswordReset.entity";
import {
    ActivateOrganization,
    CreatePassword,
    PasswordResetEmail, ReportUserEmail,
    SendInvitationEmail,
    VerifyEmail
} from "../helper/Emails.helper";
import {type} from "node:os";
import {EmailService} from "./Email.service";
import {Equal, FindOptionsWhere, In, IsNull, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not, Raw} from "typeorm";
import {ServiceDetails} from "../entity/ServiceDetails.entity";
import Joi from "joi";
import {Organization} from "../entity/Organization.entity";
import {ResponseFormatter} from "../helper/ResponseFormatter.helper";
import {ServiceSetting} from "../entity/ServiceSetting.entity";
import {EmailReminder} from "../entity/EmailReminder.entity";
import {AssignedServices, ClientStatus} from "../entity/AssignedServices.entity";
import {ReportUser} from "../entity/ReportUser";
import {ClientService} from "../entity/ClientService.entity";
import {ReportService} from "../entity/ReportService.entity";
import {Affiliations} from "../entity/Affiliations.entity";
import {ConfigService} from "./Config.service";

export class AnalyticsService {
    private userRepository = AppDataSource.getRepository(Users);
    private organizationRepository = AppDataSource.getRepository(Organization);
    private passwordResetRepository = AppDataSource.getRepository(PasswordReset);
    private serviceDetailsRepository = AppDataSource.getRepository(ServiceDetails);
    private emailReminderRepository = AppDataSource.getRepository(EmailReminder);
    private assignedServiceRepository = AppDataSource.getRepository(AssignedServices);
    private reportUserRepository = AppDataSource.getRepository(ReportUser);
    private reportServiceRepository = AppDataSource.getRepository(ReportService);
    private clientServiceRepository = AppDataSource.getRepository(ClientService);
    private affiliationRepository = AppDataSource.getRepository(Affiliations);
    private mailerService = new EmailService();
    private configService = new ConfigService();

    async getOrganizationCount(from_date?: string, to_date?: string) {
        const query = this.organizationRepository.createQueryBuilder("org");

        if (from_date && to_date) {
            query.andWhere(
                "org.created_at BETWEEN :from AND :to",
                {
                    from: new Date(from_date),
                    to: new Date(to_date),
                }
            );
        }

        return await query.getCount();
        // return count;
    }

    async getServiceCount(from_date?: string, to_date?: string) {
        const query = this.serviceDetailsRepository.createQueryBuilder("service");

        if (from_date && to_date) {
            query.andWhere(
                "service.created_at BETWEEN :from AND :to",
                {
                    from: new Date(from_date),
                    to: new Date(to_date),
                }
            );
        }

        return await query.getCount();
        // return count;
    }

    async getUserCount(type: number, from_date?: string, to_date?: string) {
        const query = this.userRepository
            .createQueryBuilder("user")
            .where("user.role = :type", {type});

        if (from_date && to_date) {
            query.andWhere(
                "user.created_at BETWEEN :from AND :to",
                {
                    from: new Date(from_date),
                    to: new Date(to_date),
                }
            );
        }

        return await query.getCount();
        // return count;
    }

    async getServiceRequestCount(status?: number, from_date?: string, to_date?: string) {
        const query = this.assignedServiceRepository
            .createQueryBuilder("service_request");

        if (status) {
            query.andWhere("service_request.status = :status", {status});
        }

        if (from_date && to_date) {
            query.andWhere(
                "service_request.created_at BETWEEN :from AND :to",
                {
                    from: new Date(from_date),
                    to: new Date(to_date),
                }
            );
        }

        return await query.getCount();
        // return count;
    }

    async getServiceRequestDemo(from_date?: string, to_date?: string) {
        // Aggregate from DB
        const qb = this.assignedServiceRepository
            .createQueryBuilder("as")
            .innerJoin("as.service", "service")
            .select("service.service_type", "data")
            .addSelect("COUNT(as.id)", "count");

        if (from_date) {
            qb.andWhere("as.created_at >= :from_date", { from_date });
        }

        if (to_date) {
            qb.andWhere("as.created_at <= :to_date", { to_date });
        }

        if (from_date && to_date) {
            qb.andWhere(
                "as.created_at BETWEEN :from_date AND :to_date",
                { from_date, to_date }
            );
        }

        const raw = await qb
            .groupBy("service.service_type")
            .getRawMany();

        // Total count
        const total = raw.reduce((sum, r) => sum + Number(r.count), 0);

        // Convert raw result to lookup map
        const countMap = raw.reduce<Record<number, number>>((acc, r) => {
            acc[Number(r.data)] = Number(r.count);
            return acc;
        }, {});

        // Your master service types
        const serviceTypes = await this.configService.getServiceOptions("service_type");
        const dataArray = serviceTypes.map((item) => ({
            id: item.id,
            name: item.name,
            icon: item.icon,
        }));

        return returnFormat(dataArray, total, countMap);
    }

    async getEnglishSpeakingAbilityDistribution(from_date?: string, to_date?: string) {
        // Aggregate from DB
        const qb = this.assignedServiceRepository
            .createQueryBuilder("as")
            .leftJoin("as.client_service", "cs")
            .select("cs.english_speaking_ability", "data")
            .addSelect("COUNT(as.id)", "count")
            .where("cs.english_speaking_ability IS NOT NULL")

        if (from_date) {
            qb.andWhere("as.created_at >= :from_date", { from_date });
        }

        if (to_date) {
            qb.andWhere("as.created_at <= :to_date", { to_date });
        }

        if (from_date && to_date) {
            qb.andWhere(
                "as.created_at BETWEEN :from_date AND :to_date",
                { from_date, to_date }
            );
        }

        const raw = await qb
            .groupBy("cs.english_speaking_ability")
            .getRawMany();

        // Total count
        const total = raw.reduce((sum, r) => sum + Number(r.count), 0);

        // Convert raw result to lookup map
        const countMap = raw.reduce<Record<number, number>>((acc, r) => {
            acc[Number(r.data)] = Number(r.count);
            return acc;
        }, {});

        // Master speaking ability list
        const dataArray = [
            { id: 1, name: "Fluent" },
            { id: 2, name: "Limited" },
            { id: 3, name: "None" },
        ];

        // Merge + percentage
        return returnFormat(dataArray, total, countMap);
    }

    async getGenderDistribution(from_date?: string, to_date?: string) {
        const qb = this.assignedServiceRepository
            .createQueryBuilder("as")
            .leftJoin("as.client_service", "cs")
            .select("cs.gender", "data")
            .addSelect("COUNT(*)", "count")
            .where("cs.gender IS NOT NULL")

        if (from_date) {
            qb.andWhere("as.created_at >= :from_date", { from_date });
        }

        if (to_date) {
            qb.andWhere("as.created_at <= :to_date", { to_date });
        }

        if (from_date && to_date) {
            qb.andWhere(
                "as.created_at BETWEEN :from_date AND :to_date",
                { from_date, to_date }
            );
        }

        const raw = await qb
            .groupBy("cs.gender")
            .getRawMany();

        const total = raw.reduce((sum, r) => sum + Number(r.count), 0);

        const countMap = raw.reduce<Record<number, number>>((acc, r) => {
            acc[Number(r.data)] = Number(r.count); // 🔑 fix
            return acc;
        }, {});

        const dataArray = [
            { id: 11, name: "Female" },
            { id: 12, name: "Male" },
            { id: 13, name: "Non-Binary" },
            { id: 14, name: "Transgender" },
            { id: 15, name: "Two-Spirit" },
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getCitizenshipStatusDistribution(from_date?: string, to_date?: string) {
        const qb = this.assignedServiceRepository
            .createQueryBuilder("as")
            .leftJoin("as.client_service", "cs")
            .select("cs.citizenship_status", "data")
            .addSelect("COUNT(*)", "count")
            .where("cs.citizenship_status IS NOT NULL")

        if (from_date) {
            qb.andWhere("as.created_at >= :from_date", { from_date });
        }

        if (to_date) {
            qb.andWhere("as.created_at <= :to_date", { to_date });
        }

        if (from_date && to_date) {
            qb.andWhere(
                "as.created_at BETWEEN :from_date AND :to_date",
                { from_date, to_date }
            );
        }

        const raw = await qb
            .groupBy("cs.citizenship_status")
            .getRawMany();

        const total = raw.reduce((sum, r) => sum + Number(r.count), 0);

        const countMap = raw.reduce<Record<number, number>>((acc, r) => {
            acc[Number(r.data)] = Number(r.count); // 🔑 fix
            return acc;
        }, {});

        const dataArray = [
            {
                "id": 10,
                "name": "US Citizen"
            },
            {
                "id": 11,
                "name": "Documented foreign national"
            },
            {
                "id": 12,
                "name": "Undocumented foreign national"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getClientExperienceDistribution(from_date?: string, to_date?: string) {
        const qb = this.assignedServiceRepository
            .createQueryBuilder("as")
            .leftJoin("as.client_service", "cs")
            .select("cs.client_experienced", "data")
            .where("cs.client_experienced IS NOT NULL")

        if (from_date) {
            qb.andWhere("as.created_at >= :from_date", { from_date });
        }

        if (to_date) {
            qb.andWhere("as.created_at <= :to_date", { to_date });
        }

        if (from_date && to_date) {
            qb.andWhere(
                "as.created_at BETWEEN :from_date AND :to_date",
                { from_date, to_date }
            );
        }

        const raw = await qb
            .getRawMany();

        const countMap: Record<number, number> = {};

        raw.forEach((r) => {
            const values = String(r.data)
                .split(",")
                .map(v => Number(v))
                .filter(Boolean);

            values.forEach((v) => {
                countMap[v] = (countMap[v] || 0) + 1;
            });
        });

        const total = Object.values(countMap)
            .reduce((sum, c) => sum + c, 0);


        const dataArray = [
            { id: 27, name: "Sex Trafficking" },
            { id: 28, name: "Labor Trafficking" },
            { id: 29, name: "Prostitution" },
            { id: 30, name: "Survival Sex" },
            { id: 31, name: "Other forms of commercial sex" },
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getPregnancyDistribution(from_date?: string, to_date?: string) {
        const qb = this.assignedServiceRepository
            .createQueryBuilder("as")
            .leftJoin("as.client_service", "cs")
            .select("cs.pregnant", "data")
            .addSelect("COUNT(*)", "count")
            .where("cs.pregnant IS NOT NULL")

        if (from_date) {
            qb.andWhere("as.created_at >= :from_date", { from_date });
        }

        if (to_date) {
            qb.andWhere("as.created_at <= :to_date", { to_date });
        }

        if (from_date && to_date) {
            qb.andWhere(
                "as.created_at BETWEEN :from_date AND :to_date",
                { from_date, to_date }
            );
        }

        const raw = await qb
            .groupBy("cs.pregnant")
            .getRawMany();

        const total = raw.reduce((sum, r) => sum + Number(r.count), 0);

        const countMap = raw.reduce<Record<number, number>>((acc, r) => {
            acc[Number(r.data)] = Number(r.count);
            return acc;
        }, {});

        const dataArray = [
            {
                "id": 0,
                "name": "No"
            },
            {
                "id": 1,
                "name": "Yes"
            },
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getBirthdateDistribution(from_date?: string, to_date?: string) {
        const qb = this.assignedServiceRepository
            .createQueryBuilder("as")
            .leftJoin("as.client_service", "cs")
            .select("cs.birthdate_status", "data")
            .addSelect("COUNT(*)", "count")
            .where("cs.birthdate_status IS NOT NULL")

        if (from_date) {
            qb.andWhere("as.created_at >= :from_date", { from_date });
        }

        if (to_date) {
            qb.andWhere("as.created_at <= :to_date", { to_date });
        }

        if (from_date && to_date) {
            qb.andWhere(
                "as.created_at BETWEEN :from_date AND :to_date",
                { from_date, to_date }
            );
        }

        const raw = await qb
            .groupBy("cs.birthdate_status")
            .getRawMany();

        const total = raw.reduce((sum, r) => sum + Number(r.count), 0);

        const countMap = raw.reduce<Record<number, number>>((acc, r) => {
            acc[Number(r.data)] = Number(r.count); // 🔑 fix
            return acc;
        }, {});

        const dataArray = [
            {
                "id": 13,
                "name": "Emancipated"
            },
            {
                "id": 14,
                "name": "Ward of the State"
            },
            {
                "id": 15,
                "name": "About to age-out"
            },
            {
                "id": 16,
                "name": "Parent or guardian consent"
            },
            {
                "id": 17,
                "name": "Determination in Process"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getChildrenAccompanyDistribution(from_date?: string, to_date?: string) {
        const qb = this.assignedServiceRepository
            .createQueryBuilder("as")
            .leftJoin("as.client_service", "cs")
            .select("cs.children_accompany", "data")
            .addSelect("COUNT(*)", "count")
            .where("cs.children_accompany IS NOT NULL")

        if (from_date) {
            qb.andWhere("as.created_at >= :from_date", { from_date });
        }

        if (to_date) {
            qb.andWhere("as.created_at <= :to_date", { to_date });
        }

        if (from_date && to_date) {
            qb.andWhere(
                "as.created_at BETWEEN :from_date AND :to_date",
                { from_date, to_date }
            );
        }

        const raw = await qb
            .groupBy("cs.children_accompany")
            .getRawMany();

        const total = raw.reduce((sum, r) => sum + Number(r.count), 0);

        const countMap = raw.reduce<Record<number, number>>((acc, r) => {
            acc[Number(r.data)] = Number(r.count); // 🔑 fix
            return acc;
        }, {});

        const dataArray = [
            {
                "id": 13,
                "name": "Emancipated"
            },
            {
                "id": 14,
                "name": "Ward of the State"
            },
            {
                "id": 15,
                "name": "About to age-out"
            },
            {
                "id": 16,
                "name": "Parent or guardian consent"
            },
            {
                "id": 17,
                "name": "Determination in Process"
            }
        ];

        return dataArray.map((item) => {
            const count = countMap[item.id] ?? 0;

            return {
                id: item.id,
                name: item.name,
                count,
                percentage: total > 0
                    ? Number(((count / total) * 100).toFixed(2))
                    : 0,
            };
        });
    }

    async getCriteriaDistribution(from_date?: string, to_date?: string) {
        const qb = this.assignedServiceRepository
            .createQueryBuilder("as")
            .leftJoin("as.client_service", "cs")
            .select("cs.criteria", "data")
            .where("cs.criteria IS NOT NULL")


        if (from_date) {
            qb.andWhere("as.created_at >= :from_date", { from_date });
        }

        if (to_date) {
            qb.andWhere("as.created_at <= :to_date", { to_date });
        }

        if (from_date && to_date) {
            qb.andWhere(
                "as.created_at BETWEEN :from_date AND :to_date",
                { from_date, to_date }
            );
        }

        const raw = await qb
            .getRawMany();


        const countMap: Record<number, number> = {};

        raw.forEach((r) => {
            const values = String(r.data)
                .split(",")
                .map(v => Number(v))
                .filter(Boolean);

            values.forEach((v) => {
                countMap[v] = (countMap[v] || 0) + 1;
            });
        });

        const total = Object.values(countMap)
            .reduce((sum, c) => sum + c, 0);


        const dataArray = [
            {
                "id": 32,
                "name": "have an abuser actively looking for them"
            },
            {
                "id": 33,
                "name": "have outstanding warrants or legal obligations"
            },
            {
                "id": 34,
                "name": "are involved in open or pending investigations or cases"
            },
            {
                "id": 35,
                "name": "are currently incarcerated"
            },
            {
                "id": 36,
                "name": "were recently incarcerated"
            },
            {
                "id": 37,
                "name": "will be on parole or probation"
            },
            {
                "id": 38,
                "name": "are part of a diversion program with court requirements"
            },
            {
                "id": 39,
                "name": "have a history of criminal charges"
            },
            {
                "id": 40,
                "name": "are registered sex offenders"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getServicesByStatus(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.waitlist", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.waitlist IS NOT NULL");

        if (from_date) {
            qb.andWhere("sd.created_at >= :from_date", { from_date });
        }

        if (to_date) {
            qb.andWhere("sd.created_at <= :to_date", { to_date });
        }

        if (from_date && to_date) {
            qb.andWhere(
                "sd.created_at BETWEEN :from_date AND :to_date",
                { from_date, to_date }
            );
        }

        const raw = await qb
            .groupBy("sd.waitlist")
            .getRawMany();


        const total = raw.reduce((sum, r) => sum + Number(r.count), 0);

        const countMap = raw.reduce<Record<number, number>>((acc, r) => {
            acc[Number(r.data)] = Number(r.count);
            return acc;
        }, {});


        const dataArray = [
            {
                "id": 0,
                "name": "Open"
            },
            {
                "id": 1,
                "name": "Waitlist"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getServicesByServiceModel(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.service_model", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.service_model IS NOT NULL");


        if (from_date) {
            qb.andWhere("sd.created_at >= :from_date", { from_date });
        }

        if (to_date) {
            qb.andWhere("sd.created_at <= :to_date", { to_date });
        }

        if (from_date && to_date) {
            qb.andWhere(
                "sd.created_at BETWEEN :from_date AND :to_date",
                { from_date, to_date }
            );
        }

        const raw = await qb
            .groupBy("sd.service_model")
            .getRawMany();


        const countMap: Record<number, number> = {};

        raw.forEach((r) => {
            const values = String(r.data)
                .split(",")
                .map(v => Number(v))
                .filter(Boolean);

            values.forEach((v) => {
                countMap[v] = (countMap[v] || 0) + 1;
            });
        });

        const total = Object.values(countMap)
            .reduce((sum, c) => sum + c, 0);


        const dataArray = [
            {
                "id": 96,
                "name": "Person-Centered/Individualized"
            },
            {
                "id": 97,
                "name": "Survivor-Informed"
            },
            {
                "id": 98,
                "name": "Program-Centered/curriculum-based"
            },
            {
                "id": 99,
                "name": "Faith-based"
            },
            {
                "id": 100,
                "name": "Trauma-Informed"
            },
            {
                "id": 101,
                "name": "Clean and sober"
            },
            {
                "id": 102,
                "name": "Evidence-Based"
            },
            {
                "id": 103,
                "name": "Harm Reduction"
            },
            {
                "id": 104,
                "name": "Strengths-Based"
            },
            {
                "id": 105,
                "name": "Recovery-Focused"
            },
            {
                "id": 106,
                "name": "Survivor-Led"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getServicesBySlotsBeds(from_date?: string, to_date?: string) {
        const typeCase = `
        CASE 
            WHEN sd.slots_beds IS NOT NULL THEN 8
            ELSE 9
        END
    `;

        const nameCase = `
        CASE 
            WHEN sd.slots_beds IS NOT NULL THEN 'Total beds'
            ELSE 'Total slots'
        END
    `;

        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select(typeCase, "id")
            .addSelect(nameCase, "name")
            .addSelect("SUM(sd.slots_available)", "total_available")
            .addSelect("AVG(sd.slots_available)", "average_available")
            .where("sd.slots_available IS NOT NULL")
            .groupBy(typeCase)
            .addGroupBy(nameCase);

        // Optional date filters (safe)
        if (from_date && to_date) {
            qb.andWhere(
                "sd.created_at BETWEEN :from_date AND :to_date",
                {
                    from_date: `${from_date} 00:00:00`,
                    to_date: `${to_date} 23:59:59`,
                }
            );
        } else {
            if (from_date) {
                qb.andWhere("sd.created_at >= :from_date", {
                    from_date: `${from_date} 00:00:00`,
                });
            }
            if (to_date) {
                qb.andWhere("sd.created_at <= :to_date", {
                    to_date: `${to_date} 23:59:59`,
                });
            }
        }

        return qb.getRawMany();
    }

}

const returnFormat = (data: any, total: number, countMap: Record<string, number>) => {
    const distribution = data.map((type) => {
        const count = countMap[type.id] || 0;

        return {
            id: type.id,
            name: type.name,
            icon: type.icon,
            count,
            percentage: total > 0
                ? Number(((count / total) * 100).toFixed(2))
                : 0,
        };
    });

    return {
        total,
        data: distribution
    };
}


