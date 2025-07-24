import {UserService} from "../services/User.service";
import {OrganizationService} from "../services/Organization.service";
import {ConfigService} from "../services/Config.service";
import {TimePeriod} from "../entity/ServiceDetails.entity";
import {getRoleNameById} from "./Common.util";
import {Constants} from "../helper/Constants.helper";

const userService = new UserService();
const organizationService = new OrganizationService();
const configService = new ConfigService();

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
            services: getServices.map(item => ({
                name: item.service.name
            })),
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
