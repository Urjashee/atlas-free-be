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
    private serviceDetailsRepository = AppDataSource.getRepository(ServiceDetails);
    private assignedServiceRepository = AppDataSource.getRepository(AssignedServices);
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
                "id": 1,
                "name": "Yes"
            },
            {
                "id": 2,
                "name": "No"
            },
            {
                "id": 3,
                "name": "Preferred"
            }
        ];

        return returnFormat(dataArray, total, countMap);
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
        const rows = await this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.slots_beds", "slots_beds")
            .addSelect("SUM(sd.slots_available)", "total")
            .addSelect("AVG(sd.slots_available)", "average")
            .addSelect("COUNT(*)", "count")
            .where("sd.slots_beds IS NOT NULL")
            .groupBy("sd.slots_beds")
            .getRawMany();

        return formatSlotsBeds(rows);
    }

    async getServicesByGenderServed(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.genders_served", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.genders_served IS NOT NULL");


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
            .groupBy("sd.genders_served")
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
                "id": 10,
                "name": "All Genders (automatically selects all below)"
            },
            {
                "id": 11,
                "name": "Female"
            },
            {
                "id": 12,
                "name": "Male"
            },
            {
                "id": 13,
                "name": "Non-Binary"
            },
            {
                "id": 14,
                "name": "Transgender"
            },
            {
                "id": 15,
                "name": "Two-Spirit"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getServicesByServedTo(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.served_to", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.served_to IS NOT NULL");

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
            .groupBy("sd.served_to")
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
                "id": 16,
                "name": "Single Individuals"
            },
            {
                "id": 17,
                "name": "Pregnant Individuals"
            },
            {
                "id": 18,
                "name": "Parenting Individuals"
            },
            {
                "id": 19,
                "name": "Married Couples"
            },
            {
                "id": 20,
                "name": "Parenting Couples"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getServicesByCitizenshipRequirements(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.citizenship_requirement", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.citizenship_requirement IS NOT NULL");

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
            .groupBy("sd.citizenship_requirement")
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
                "id": 21,
                "name": "We accept US citizens"
            },
            {
                "id": 22,
                "name": "We accept documented foreign nationals"
            },
            {
                "id": 23,
                "name": "We accept undocumented foreign nationals"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getServicesByLanguageRequirements(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.language_requirement", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.language_requirement IS NOT NULL");

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
            .groupBy("sd.language_requirement")
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
                "id": 24,
                "name": "English-speaking"
            },
            {
                "id": 25,
                "name": "Limited English-speaking ability"
            },
            {
                "id": 26,
                "name": "No English-speaking ability"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getServicesByTraffickingStatus(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.trafficking_status", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.trafficking_status IS NOT NULL");

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
            .groupBy("sd.trafficking_status")
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
                "id": 27,
                "name": "Sex Trafficking"
            },
            {
                "id": 28,
                "name": "Labor Trafficking"
            },
            {
                "id": 29,
                "name": "Prostitution"
            },
            {
                "id": 30,
                "name": "Survival Sex"
            },
            {
                "id": 31,
                "name": "Other forms of commercial sex"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getServicesByLegal(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.legal", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.legal IS NOT NULL");

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
            .groupBy("sd.legal")
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

    async getServicesByHealthNeeds(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.health_needs", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.health_needs IS NOT NULL");

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
            .groupBy("sd.health_needs")
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
                "id": 41,
                "name": "are currently taking prescribed medication for mental illness"
            },
            {
                "id": 42,
                "name": "are currently taking prescribed medication for opioid treatment"
            },
            {
                "id": 43,
                "name": "experience episodes of psychosis"
            },
            {
                "id": 44,
                "name": "have a certified service animal"
            },
            {
                "id": 45,
                "name": "have an emotional support animal"
            },
            {
                "id": 46,
                "name": "have immediate health concerns"
            },
            {
                "id": 47,
                "name": "have physical disabilities"
            },
            {
                "id": 48,
                "name": "have reported self-injuring"
            },
            {
                "id": 49,
                "name": "have reported suicide ideation"
            },
            {
                "id": 50,
                "name": "have used illegal substances in the last 30 days"
            },
            {
                "id": 51,
                "name": "have used illegal substances in the last 7 days"
            },
            {
                "id": 52,
                "name": "use alcohol"
            },
            {
                "id": 53,
                "name": "use marijuana"
            },
            {
                "id": 54,
                "name": "use tobacco products"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getServicesByMedications(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.medications", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.medications IS NOT NULL");

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
            .groupBy("sd.medications")
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
                "id": 55,
                "name": "Not taking any medications"
            },
            {
                "id": 56,
                "name": "Stimulants (Adderall, Ritalin, Vyvanse, etc)"
            },
            {
                "id": 57,
                "name": "Mood Stabilizers (Lithium, Abilify, Saphris, Vraylar, etc)"
            },
            {
                "id": 58,
                "name": "Antipsychotic (Risperdal, Seroquel, Ziprasidone, etc)"
            },
            {
                "id": 59,
                "name": "Injectables (insulin, etc)"
            },
            {
                "id": 60,
                "name": "Anti-Anxiety (Xanax, Klonopin, Valium, Ativan, etc)"
            },
            {
                "id": 61,
                "name": "Anti-Depressants/SSRI’s (Prozac, Seroxat, Lustral, Cipramil, etc)"
            },
            {
                "id": 62,
                "name": "Methadone"
            },
            {
                "id": 63,
                "name": "Suboxone"
            },
            {
                "id": 64,
                "name": "Narcotics (Vicodin, OxyContin, Percocet)"
            },
            {
                "id": 65,
                "name": "Nerve Pain/Anticonvulsant (Gabapentin, Lyrica)"
            },
            {
                "id": 66,
                "name": "Medical Marijuana"
            },
            {
                "id": 67,
                "name": "Other"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getServicesByMentalHealth(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.mental_health_diagnoses", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.mental_health_diagnoses IS NOT NULL");

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
            .groupBy("sd.mental_health_diagnoses")
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
                "id": 68,
                "name": "Anxiety"
            },
            {
                "id": 69,
                "name": "Bipolar"
            },
            {
                "id": 70,
                "name": "Borderline Personality Disorder"
            },
            {
                "id": 71,
                "name": "PTSD"
            },
            {
                "id": 72,
                "name": "Depression"
            },
            {
                "id": 73,
                "name": "Dissociative Identity Disorder"
            },
            {
                "id": 74,
                "name": "Schizophrenia"
            },
            {
                "id": 75,
                "name": "Self-injuring"
            },
            {
                "id": 76,
                "name": "Suicide ideation/Suicide Risk"
            },
            {
                "id": 77,
                "name": "Eating Disorder"
            },
            {
                "id": 78,
                "name": "None"
            },
            {
                "id": 79,
                "name": "Other (fill in option)"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getServicesByPhysicalAccommodations(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.physical_accommodations", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.physical_accommodations IS NOT NULL");

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
            .groupBy("sd.physical_accommodations")
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
                "id": 80,
                "name": "Wheelchair accessibility"
            },
            {
                "id": 81,
                "name": "Ramp access"
            },
            {
                "id": 82,
                "name": "Assistance with mobility (e.g., walking, getting to/from locations)"
            },
            {
                "id": 83,
                "name": "Visual assistance (e.g., large print, screen reader support)"
            },
            {
                "id": 84,
                "name": "Hearing assistance (e.g., sign language interpreter, hearing loop)"
            },
            {
                "id": 85,
                "name": "Seating with support (e.g., back support, specific seating arrangement)"
            },
            {
                "id": 86,
                "name": "Specialized equipment (e.g., adjustable tables, assistive technology)"
            },
            {
                "id": 87,
                "name": "None"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getServicesByEntryRequirements(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.entry_requirement", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.entry_requirement IS NOT NULL");

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
            .groupBy("sd.entry_requirement")
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
                "id": 92,
                "name": "Verified as a victim/survivor of human trafficking"
            },
            {
                "id": 93,
                "name": "Must be clean/sober for a certain number of days"
            },
            {
                "id": 94,
                "name": "Must have a clean Urine Analysis (U/A)"
            },
            {
                "id": 95,
                "name": "None of the above"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getServicesByFaithEngagement(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.faith_engagement", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.faith_engagement IS NOT NULL");

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
            .groupBy("sd.faith_engagement")
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
                "id": 107,
                "name": "None"
            },
            {
                "id": 108,
                "name": "Voluntary"
            },
            {
                "id": 109,
                "name": "Expected attendance, but not mandatory participation"
            },
            {
                "id": 110,
                "name": "Mandatory participation"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getServicesByServiceStructure(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.service_structure", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.service_structure IS NOT NULL");

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
            .groupBy("sd.service_structure")
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
                "id": 111,
                "name": "High structure (very limited free time)"
            },
            {
                "id": 112,
                "name": "Moderate structure (some free time)"
            },
            {
                "id": 113,
                "name": "Low structure (majority free time)"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getServicesBySleepingArrangement(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.sleeping_arrangement", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.sleeping_arrangement IS NOT NULL");

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
            .groupBy("sd.sleeping_arrangement")
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
                "id": 114,
                "name": "Independent housing (live alone)"
            },
            {
                "id": 115,
                "name": "Shared housing (private bedrooms)"
            },
            {
                "id": 116,
                "name": "Shared housing (shared bedrooms)"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getServicesByStaffingLevel(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.staffing_level", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.staffing_level IS NOT NULL");

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
            .groupBy("sd.staffing_level")
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
                "id": 117,
                "name": "24/7 staffing"
            },
            {
                "id": 118,
                "name": "Staff on-site sometimes"
            },
            {
                "id": 119,
                "name": "No staff on-site"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getServicesByTeamDiversity(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.teams_diversity", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.teams_diversity IS NOT NULL");

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
            .groupBy("sd.teams_diversity")
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
                "id": 120,
                "name": "Survivor(s) or Lived Experience Experts from the Commercial Sex Trade"
            },
            {
                "id": 121,
                "name": "Bilingual or Multilingual"
            },
            {
                "id": 122,
                "name": "Black, Indigenous, or People of Color"
            },
            {
                "id": 123,
                "name": "Gender and sexual minorities"
            },
            {
                "id": 124,
                "name": "People with disabilities"
            },
            {
                "id": 125,
                "name": "Religious minorities"
            }
        ];

        return returnFormat(dataArray, total, countMap);
    }

    async getServicesByServiceGuidelines(from_date?: string, to_date?: string) {
        const qb = this.serviceDetailsRepository
            .createQueryBuilder("sd")
            .select("sd.service_guidelines", "data")
            .addSelect("COUNT(*)", "count")
            .where("sd.service_guidelines IS NOT NULL");

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
            .groupBy("sd.service_guidelines")
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
                "id": 126,
                "name": "Daily curfew (must be in by a certain time each night)"
            },
            {
                "id": 127,
                "name": "Initial blackout period (no phone, no Internet, etc)"
            },
            {
                "id": 128,
                "name": "No unapproved visitors"
            },
            {
                "id": 129,
                "name": "None of the above"
            }
        ];

        return returnFormat(dataArray, total, countMap);
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

const formatSlotsBeds = (rows: any[]) => {
    const result = {
        beds: { count: 0, total: 0 },
        slots: { count: 0, total: 0 },
    };

    for (const row of rows) {
        const slotsBeds = Number(row.slots_beds);
        const count = Number(row.count);
        const total = Number(row.total);

        // ignore 0 if needed
        if (slotsBeds === 0) continue;

        // RULE: >=9 → Beds, <9 → Slots
        if (slotsBeds >= 9) {
            result.beds.count += count;
            result.beds.total += total;
        } else {
            result.slots.count += count;
            result.slots.total += total;
        }
    }

    return [
        {
            id: 1,
            name: "Beds",
            count: result.beds.total,
            average: result.beds.count
                ? Number((result.beds.total / result.beds.count).toFixed(2))
                : 0,
        },
        {
            id: 2,
            name: "Slots",
            count: result.slots.total,
            average: result.slots.count
                ? Number((result.slots.total / result.slots.count).toFixed(2))
                : 0,
        },
    ];
}



