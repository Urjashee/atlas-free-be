import {UserService} from "../services/UserService";
import {OrganizationService} from "../services/OrganizationService";
import {ConfigService} from "../services/ConfigService";
import {TimePeriod} from "../entity/OrganizationDetails.entity";

const userService = new UserService();
const organizationService = new OrganizationService();
const configService = new ConfigService();

export async function getOrganizationsServiceDetails(getOrganizationServices: any) {
    return await Promise.all(
        getOrganizationServices.map(async (service: any) => {
            return {
                id: service.id,
                name: service.name,
                service_type_id: service.service_type,
                service_type: (await configService.getServiceOptionsById(service.service_type)).name,
                slots_beds: (await configService.getServiceOptionsById(service.slots_beds)).name,
                client_slots: service.client_slots,
                client_slots_available: service.client_slots_available,
                start_day_of_service: new Date(service.start_day_of_service).toISOString().split('T')[0],
                service_limited: service.service_limited,
                enrollment_type: TimePeriod[service.enrollment_type], // Get data from enum
                enrollment_period: service.enrollment_period,
                extension: service.extension,
                waitlist: service.waitlist,
                service_description: service.service_description,
                minimum_age: service.minimum_age,
                maximum_age: service.maximum_age,
                genders_served: await Promise.all(service.genders_served.map(async (item) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                served_to: await Promise.all(service.served_to.map(async (item) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                minimum_children_age: service.minimum_children_age,
                maximum_children_age: service.maximum_children_age,
                maximum_children_intake: service.maximum_children_intake,
                citizenship_requirement: await Promise.all(service.citizenship_requirement.map(async (item) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                language_requirement: await Promise.all(service.language_requirement.map(async (item) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                out_of_state_relocation: service.out_of_state_relocation,
                trafficking_status: await Promise.all(service.trafficking_status.map(async (item) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                legal: await Promise.all(service.legal.map(async (item) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                health_needs: await Promise.all(service.health_needs.map(async (item) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                medications: await Promise.all(service.medications.map(async (item) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                mental_health_diagnoses: await Promise.all(service.mental_health_diagnoses.map(async (item) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                physical_accommodations: await Promise.all(service.physical_accommodations.map(async (item) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                smoking_allowed: await Promise.all(service.smoking_allowed.map(async (item) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                entry_requirement: await Promise.all(service.entry_requirement.map(async (item) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                days_sober: service.days_sober,
                service_model: await Promise.all(service.service_model.map(async (item) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                "faith_engagement": (await configService.getServiceOptionsById(service.faith_engagement)).name,
                "faith_engagement_practice": service.faith_engagement_practice,
                "service_structure": (await configService.getServiceOptionsById(service.service_structure)).name,
                "sleeping_arrangement": (await configService.getServiceOptionsById(service.sleeping_arrangement)).name,
                "staffing_level": (await configService.getServiceOptionsById(service.staffing_level)).name,
                "teams_diversity": await Promise.all(service.teams_diversity.map(async (item) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                "service_guidelines": await Promise.all(service.service_guidelines.map(async (item) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                "support_provided": await Promise.all(service.support_provided.map(async (item) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                "support_offered": await Promise.all(service.support_offered.map(async (item) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                intake_process: service.intake_process,
                additional_requirements: service.additional_requirements,
                reason_for_removal: service.reason_for_removal,
                is_submitted: service.is_submitted,
            };
        })
    );
}
