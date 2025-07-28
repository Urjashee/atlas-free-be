import {UserService} from "../services/User.service";
import {OrganizationService} from "../services/Organization.service";
import {ConfigService} from "../services/Config.service";
import {TimePeriod} from "../entity/ServiceDetails.entity";
import {getRoleNameById} from "./Common.util";
import {Constants} from "../helper/Constants.helper";
import {ResponseFormatter} from "../helper/ResponseFormatter.helper";
import {getClientDetails} from "./Advocate.util";
import {ClientService} from "../services/Client.service";
import {AdvocateService} from "../services/Advocate.service";

const userService = new UserService();
const organizationService = new OrganizationService();
const configService = new ConfigService();
const clientService = new ClientService();
const advocateService = new AdvocateService();

export async function getOrganizationsServiceDetails(service: any) {
    return {
        id: service.id,
        name: service.name,
        service_type_id: service.service_type,
        service_type: (await configService.getServiceOptionsById(service.service_type)).name,
        slots_beds_id: service.slots_beds,
        slots_beds: (await configService.getServiceOptionsById(service.slots_beds)).name,
        client_slots: service.client_slots,
        client_slots_available: service.client_slots_available,
        start_day_of_service: new Date(service.start_day_of_service).toISOString().split('T')[0],
        service_limited: service.service_limited,
        enrollment_type_id: service.enrollment_type,
        enrollment_type: TimePeriod[service.enrollment_type],
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
        faith_engagement_id: service.faith_engagement,
        "faith_engagement": (await configService.getServiceOptionsById(service.faith_engagement)).name,
        "faith_engagement_practice": service.faith_engagement_practice,
        service_structure_id: service.service_structure,
        "service_structure": (await configService.getServiceOptionsById(service.service_structure)).name,
        sleeping_arrangement_id: service.sleeping_arrangement,
        "sleeping_arrangement": (await configService.getServiceOptionsById(service.sleeping_arrangement)).name,
        staffing_level_id: service.staffing_level,
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
}

export async function getOrganizationsDetails(organization: any) {
    const ids = organization.organization.primary_purpose.map(id => Number(id));
    const purposes = await configService.getPrimaryPurposeById(ids);
    return {
        id: organization.organization.id,
        is_active: organization.organization.is_active,
        name: organization.organization.name,
        email: organization.email,
        country_code: organization.country_code,
        phone_no: organization.mobile,
        zipcode: organization.organization.zipcode,
        website: organization.organization.website,
        year: organization.organization.year,
        address: organization.organization.address,
        primary_purpose: purposes.map(purpose => ({
            id: purpose.id,
            name: purpose.name,
        })),
        tax_status: organization.organization.tax_exemption == false ? "No" : "Yes",
        affiliation: organization.organization.affiliations.map(item => ({
            id: item.affiliation.id,
            name: item.affiliation.name,
            file: item.affiliation_file
        }))
    }
}

export async function getUserDetails(user: any) {
    if (user.role.id === Constants.ROLE_ORGANIZATION || user.role.id === Constants.ROLE_ADVOCATE) {
        const getClients = await organizationService.getOrganizationClientsByUserId(user.id);
        return {
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_no: user.mobile,
            country_code: user.country_code,
            role: getRoleNameById(user.role.id),
            client: await Promise.all(getClients.map((item) => ({
                id: item.id,
                client_number: item.case_no,
                client_nick_name: item.client_service.client_nick_name,
                dob: new Date(item.client_service.dob).toISOString().split('T')[0],
                zipcode: item.client_service.zipcode,
            }))),
            created_at: new Date(user.created_at).toISOString().split('T')[0],
        }
    }
    if (user.role.id === Constants.ROLE_SERVICE_MANAGER) {
        const getServices = await organizationService.getOrganizationServicesByUserId(user.id);
        return {
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_no: user.mobile,
            country_code: user.country_code,
            role: getRoleNameById(user.role.id),
            services: await Promise.all(
                getServices.map(async (item) => ({
                    id: item.service.id,
                    name: item.service.name,
                    service_type: (await configService.getServiceOptionsById(item.service.service_type)).name,
                    address: item.service.disclose_address == false ? `${item.service.address} ${item.service.street} ${item.service.city} ${item.service.state.name} ${item.service.zipcode}` : "",
                }))
            ),
            created_at: new Date(user.created_at).toISOString().split('T')[0],
        }
    }
    return {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_no: user.mobile,
        country_code: user.country_code,
        role: getRoleNameById(user.role.id),
        created_at: new Date(user.created_at).toISOString().split('T')[0],
    }
}

export async function getFormDetails(form: any) {
    return {
        id: form.id,
        service_type: await Promise.all(form.service.map(async (item) => {
            return {
                id: item,
                name: (await configService.getServiceOptionsById(item.service_type)).name
            }
        })),
    }
}

export async function getServiceRequests(organization_id: number, page_number: number, page_size: number, status: number) {
    const {
        data,
        total
    } = await organizationService.getServiceRequests(organization_id, page_number, page_size, status);

    const customResponse = [];

    for (const service of data) {

        const user = await userService.findById(service.user.id);
        if (user.role.id != Constants.ROLE_SURVIVOR) {
            customResponse.push({
                type: "user",
                id: service.id,
                service_id: service.service.id,
                service: service.service.name,
                case_no: service.case_no,
                requested_by: `${user.first_name} ${user.last_name}`,
                date_time: service.created_at,
                service_request: service.status,
                client_service_id: service.client_service.id,
                user: service.user.id
            });
        }

        if (user.role.id == Constants.ROLE_SURVIVOR) {
            customResponse.push({
                type: "survivor",
                id: service.id,
                service_id: service.service.id,
                service: service.service.name,
                client_name: `${user.user_name}`,
                client_email: user.email,
                date_time: service.created_at,
                service_request: service.status,
                client_service_id: service.client_service.id,
                user: service.user.id
            });
        }
    }

    return {
        current_page: page_number,
        page_size,
        total_items: total,
        total_pages: Math.ceil(total / page_size),
        data: customResponse
    };
}

export async function getServiceRequestDetails(serviceRequestsId: number) {
    const getServiceRequest = await clientService.getServiceRequestById(serviceRequestsId);
    if (!getServiceRequest) {
        throw new Error("Service request not found")
    }
    let client: any, form: any
    const user = await userService.findById(getServiceRequest.user.id);
    const getClients = await advocateService.getClientsById(getServiceRequest.id);

    if (user.role.id != Constants.ROLE_SURVIVOR) {
        client = {
            type: "user",
            id: getServiceRequest.id,
            service_id: getServiceRequest.service.id,
            service: getServiceRequest.service.name,
            case_no: getServiceRequest.case_no,
            requested_by: `${user.first_name} ${user.last_name}`,
            date_time: getServiceRequest.created_at,
            service_request: getServiceRequest.status,
            client_service_id: getServiceRequest.client_service.id,
            user: getServiceRequest.user.id
        };
        form = await getClientDetails(getClients, Constants.ROLE_ADVOCATE)
    }
    if (user.role.id == Constants.ROLE_SURVIVOR) {
        client = {
            type: "survivor",
            id: getServiceRequest.id,
            service_id: getServiceRequest.service.id,
            service: getServiceRequest.service.name,
            client_name: `${user.user_name}`,
            client_email: user.email,
            date_time: getServiceRequest.created_at,
            service_request: getServiceRequest.status,
            client_service_id: getServiceRequest.client_service.id,
            user: getServiceRequest.user.id
        };
        form = await getClientDetails(getClients, Constants.ROLE_SURVIVOR)
    }

    return  {
        client: client,
        form: form,
    }
}
