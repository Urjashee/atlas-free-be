import {UserService} from "../services/User.service";
import {OrganizationService} from "../services/Organization.service";
import {ConfigService} from "../services/Config.service";
import {TimePeriod} from "../entity/ServiceDetails.entity";
import {ChildrenToAccompany} from "../entity/ClientService.entity";
import {Constants} from "../helper/Constants.helper";
import {ClientStatus} from "../entity/AssignedServices.entity";

const userService = new UserService();
const organizationService = new OrganizationService();
const configService = new ConfigService();

export async function getClientDetails(clientsDetails: any) {
    return await Promise.all(
        clientsDetails.map(async (clients: any) => {
            return {
                id: clients.id,
                services: await Promise.all(clients.service.map(async (item) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                client_nick_name: clients.client_nick_name,
                zipcode: clients.zipcode,
                dob: new Date(clients.dob).toISOString().split('T')[0],
                english_speaking_ability_id: clients.english_speaking_ability,
                english_speaking_ability: (await configService.getServiceOptionsById(clients.english_speaking_ability)).name,
                preferred_language: clients.preferred_language,
                genders_served: await Promise.all(clients.gender.map(async (item: number) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                race_ethnicity: await Promise.all(clients.race.map(async (item: number) => {
                    return {
                        id: item,
                        name: (await configService.getAdvocateServiceById(item)).name
                    }
                })),
                citizenship_status: (await configService.getAdvocateServiceById(clients.citizenship_status)).name,
                client_experienced: await Promise.all(clients.client_experienced.map(async (item: number) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                pregnant: clients.pregnant,
                pregnant_months: clients.pregnant_months,
                birthdate_status: (await configService.getAdvocateServiceById(clients.birthdate_status)).name,
                children_accompany: ChildrenToAccompany[clients.children_accompany],
                children_to_accompany: clients.children_to_accompany,
                criteria: await Promise.all(clients.criteria.map(async (item: number) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                criteria_add: await Promise.all(clients.criteria_add.map(async (item: number) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                medications: await Promise.all(clients.medications.map(async (item: number) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                mental_health_diagnoses: await Promise.all(clients.mental_health_diagnoses.map(async (item: number) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                physical_accommodation: await Promise.all(clients.physical_accommodation.map(async (item: number) => {
                    return {
                        id: item,
                        name: (await configService.getServiceOptionsById(item)).name
                    }
                })),
                nicotine_products: await Promise.all(clients.nicotine_products.map(async (item: number) => {
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
export async function getServiceRequestsUser(serviceRequest: any) {
    return {
        client_id: serviceRequest.client.id,
        service_status_id: serviceRequest.status,
        service_status: ClientStatus[Number(serviceRequest.status)],
        service_name: serviceRequest.service.name,
        service_type: (await configService.getServiceOptionsById(serviceRequest.service.service_type)).name,
    }
}
