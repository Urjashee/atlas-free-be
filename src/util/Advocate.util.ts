import {UserService} from "../services/User.service";
import {OrganizationService} from "../services/Organization.service";
import {ConfigService} from "../services/Config.service";
import {TimePeriod} from "../entity/ServiceDetails.entity";
import {ChildrenToAccompany} from "../entity/ClientService.entity";
import {Constants} from "../helper/Constants.helper";
import {ClientStatus} from "../entity/AssignedServices.entity";
import {safeOptionsArray} from "./Organization.util";

const userService = new UserService();
const organizationService = new OrganizationService();
const configService = new ConfigService();

export async function getClientDetails(clientsDetails: any, role?: number) {
    if (role === Constants.ROLE_ADVOCATE || role === Constants.ROLE_ORGANIZATION_ADMIN) {
        return await Promise.all(
            clientsDetails.map(async (clients: any) => {
                return {
                    id: clients.id,
                    services: await Promise.all((clients.service ?? []).map(async (item) => {
                        return {
                            id: item,
                            name: (await configService.getServiceOptionsById(item)).name
                        }
                    })),
                    client_nick_name: clients.client_nick_name,
                    zipcode: clients.zipcode,
                    dob: new Date(clients.dob).toISOString().split('T')[0],
                    english_speaking_ability_id: clients.english_speaking_ability,
                    english_speaking_ability: (await configService.getAdvocateServiceById(clients.english_speaking_ability)).name,
                    preferred_language: clients.preferred_language,
                    gender: await Promise.all((clients.gender ?? []).map(async (item: number) => {
                        return {
                            id: item,
                            name: (await configService.getServiceOptionsById(item)).name
                        }
                    })),
                    race: await Promise.all((clients.race ?? []).map(async (item: number) => {
                        return {
                            id: item,
                            name: (await configService.getAdvocateServiceById(item)).name
                        }
                    })),
                    citizenship_status: (await configService.getAdvocateServiceById(clients.citizenship_status)).name,
                    citizenship_status_id: clients.citizenship_status,
                    client_experienced: await Promise.all((clients.client_experienced ?? []).map(async (item: number) => {
                        return {
                            id: item,
                            name: (await configService.getServiceOptionsById(item)).name
                        }
                    })),
                    pregnant: clients.pregnant == true ? "Yes" : "No",
                    pregnant_months: clients.pregnant == true ? `${clients.pregnant_months} months` : "",
                    birthdate_status: clients.birthdate_status == null ? null : (await configService.getAdvocateServiceById(clients.birthdate_status)).name,
                    birthdate_status_id: clients.birthdate_status || null,
                    children_accompany: ChildrenToAccompany[clients.children_accompany],
                    children_accompany_id: clients.children_accompany,
                    children_to_accompany: clients.children_to_accompany,
                    ages_of_children: clients.ages_of_children || "",
                    criteria: await Promise.all((clients.criteria ?? []).map(async (item: number) => {
                        return {
                            id: item,
                            name: (await configService.getServiceOptionsById(item)).name
                        }
                    })),
                    criteria_add: await safeOptionsArray(clients.criteria_add),
                    // criteria_add: await Promise.all((clients.criteria_add ?? []).map(async (item: number) => {
                    //     return {
                    //         id: item,
                    //         name: (await configService.getServiceOptionsById(item)).name
                    //     }
                    // })),
                    medications: await Promise.all((clients.medications ?? []).map(async (item: number) => {
                        return {
                            id: item,
                            name: (await configService.getServiceOptionsById(item)).name
                        }
                    })),
                    medications_other: clients.medications_other,
                    mental_health_diagnoses_other: clients.mental_health_diagnoses_other,
                    mental_health_diagnoses: await Promise.all((clients.mental_health_diagnoses ?? []).map(async (item: number) => {
                        return {
                            id: item,
                            name: (await configService.getServiceOptionsById(item)).name
                        }
                    })),
                    physical_accommodation: await Promise.all((clients.physical_accommodation ?? []).map(async (item: number) => {
                        return {
                            id: item,
                            name: (await configService.getServiceOptionsById(item)).name
                        }
                    })),
                    nicotine_products: await Promise.all((clients.nicotine_products ?? []).map(async (item: number) => {
                        return {
                            id: item,
                            name: (await configService.getServiceOptionsById(item)).name
                        }
                    })),
                    specify_physical_accommodation: clients.specify_physical_accommodation
                };
            })
        );
    }
    if (role === Constants.ROLE_SURVIVOR) {
        return await Promise.all(
            clientsDetails.map(async (clients: any) => {
                return {
                    id: clients.id,
                    services: await Promise.all((clients.service ?? []).map(async (item) => {
                        return {
                            id: item,
                            name: (await configService.getServiceOptionsById(item)).name
                        }
                    })),
                    zipcode: clients.zipcode,
                    dob: new Date(clients.dob).toISOString().split('T')[0],
                    english_speaking_ability_id: clients.english_speaking_ability,
                    english_speaking_ability: (await configService.getAdvocateServiceById(clients.english_speaking_ability)).name,
                    preferred_language: clients.preferred_language,
                    gender: await Promise.all((clients.gender ?? []).map(async (item: number) => {
                        return {
                            id: item,
                            name: (await configService.getServiceOptionsById(item)).name
                        }
                    })),
                    race: await Promise.all((clients.race ?? []).map(async (item: number) => {
                        return {
                            id: item,
                            name: (await configService.getAdvocateServiceById(item)).name
                        }
                    })),
                    citizenship_status: (await configService.getAdvocateServiceById(clients.citizenship_status)).name,
                    citizenship_status_id: clients.citizenship_status,
                    client_experienced: await Promise.all((clients.client_experienced ?? []).map(async (item: number) => {
                        return {
                            id: item,
                            name: (await configService.getServiceOptionsById(item)).name
                        }
                    })),
                    pregnant: clients.pregnant == true ? "Yes" : "No",
                    pregnant_months: clients.pregnant == true ? `${clients.pregnant_months} months` : "",
                    birthdate_status: clients.birthdate_status == null ? null : (await configService.getAdvocateServiceById(clients.birthdate_status)).name,
                    birthdate_status_id: clients.birthdate_status || null,
                    children_accompany: ChildrenToAccompany[clients.children_accompany],
                    children_accompany_id: clients.children_accompany,
                    children_to_accompany: clients.children_to_accompany,
                    ages_of_children: clients.ages_of_children || "",
                    criteria: await Promise.all((clients.criteria ?? []).map(async (item: number) => {
                        return {
                            id: item,
                            name: (await configService.getServiceOptionsById(item)).name
                        }
                    })),
                    criteria_add: await safeOptionsArray(clients.criteria_add),
                    medications: await Promise.all((clients.medications ?? []).map(async (item: number) => {
                        return {
                            id: item,
                            name: (await configService.getServiceOptionsById(item)).name
                        }
                    })),
                    medications_other: clients.medications_other,
                    mental_health_diagnoses_other: clients.mental_health_diagnoses_other,
                    mental_health_diagnoses: await Promise.all((clients.mental_health_diagnoses ?? []).map(async (item: number) => {
                        return {
                            id: item,
                            name: (await configService.getServiceOptionsById(item)).name
                        }
                    })),
                    physical_accommodation: await Promise.all((clients.physical_accommodation ?? []).map(async (item: number) => {
                        return {
                            id: item,
                            name: (await configService.getServiceOptionsById(item)).name
                        }
                    })),
                    nicotine_products: await Promise.all((clients.nicotine_products ?? []).map(async (item: number) => {
                        return {
                            id: item,
                            name: (await configService.getServiceOptionsById(item)).name
                        }
                    })),
                    specify_physical_accommodation: clients.specify_physical_accommodation
                };
            })
        );
    }
}

export async function getServiceRequestsUser(serviceRequests: any) {
    if (!serviceRequests) return [];

    // Normalize to array
    const requestsArray = Array.isArray(serviceRequests)
    if (!requestsArray) {
        return {
            client_id: serviceRequests?.id ?? null,
            service_status_id: serviceRequests?.status ?? null,
            service_status: serviceRequests?.status
                ? ClientStatus[Number(serviceRequests.status)]
                : null,
            requested_service_id: serviceRequests?.service?.id ?? null,
            service_name: serviceRequests?.service?.name ?? null,
            service_type: serviceRequests?.service?.service_type
                ? (await configService.getServiceOptionsById(
                serviceRequests.service.service_type
            ))?.name ?? null
                : null,
            date: serviceRequests?.created_at ?? null,
        }
    }
    else {
        if (serviceRequests.length === 0) return [];

        return Promise.all(
            serviceRequests.map(async (serviceRequest: any) => ({
                client_id: serviceRequest?.id ?? null,
                service_status_id: serviceRequest?.status ?? null,
                service_status: serviceRequest?.status
                    ? ClientStatus[Number(serviceRequest.status)]
                    : null,
                requested_service_id: serviceRequest?.service?.id ?? null,
                service_name: serviceRequest?.service?.name ?? null,
                service_type: serviceRequest?.service?.service_type
                    ? (await configService.getServiceOptionsById(
                    serviceRequest.service.service_type
                ))?.name ?? null
                    : null,
                date: serviceRequest?.created_at ?? null,
            }))
        );
    }
}


