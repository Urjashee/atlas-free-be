import {UserService} from "../services/User.service";
import {OrganizationService} from "../services/Organization.service";
import {ConfigService} from "../services/Config.service";
import {TimePeriod} from "../entity/ServiceDetails.entity";
import {getRoleNameById} from "./Common.util";
import {Constants, roleMap, roleTypeMap, statusMap} from "../helper/Constants.helper";
import {ResponseFormatter} from "../helper/ResponseFormatter.helper";
import {getClientDetails} from "./Advocate.util";
import {ClientService} from "../services/Client.service";
import {AdvocateService} from "../services/Advocate.service";

const userService = new UserService();
const organizationService = new OrganizationService();
const configService = new ConfigService();
const clientService = new ClientService();
const advocateService = new AdvocateService();

export async function getOrganizationsServiceDetails(service: any, roleId?: number) {
    const isAdmin =
        roleId === Constants.ROLE_ADMIN ||
        roleId === Constants.ROLE_ORGANIZATION_ADMIN;
        roleId === Constants.ROLE_SERVICE_MANAGER;
    return {
        id: service?.id ?? null,
        name: service?.name ?? "",

        // address: (service?.disclose_address || roleId === Constants.ROLE_ORGANIZATION_ADMIN)
        //     ? `${service.address ?? ""} ${service.street ?? ""} ${service.city ?? ""} ${service.state?.name ?? ""} ${service.zipcode ?? ""}`.trim()
        //     : "",

        address: isAdmin || !service?.disclose_address ? service.address : "-",
        street: isAdmin || !service?.disclose_address ? service.street : "-",
        city: isAdmin || !service?.disclose_address ? service.city : "-",
        state_id: isAdmin || !service?.disclose_address ? service.state?.id : "-",
        state: isAdmin || !service?.disclose_address ? service.state?.name : "-",
        zipcode: service.zipcode,
        disclose_address: service?.disclose_address,
        is_organization_address: service.is_organization_address,

        service_type_id: service?.service_type ?? null,
        service_type: service?.service_type
            ? (await configService.getServiceOptionsById(service.service_type))?.name ?? ""
            : "",
        service_type_icon: service?.service_type
            ? (await configService.getServiceOptionsById(service.service_type))?.icon ?? ""
            : "",

        slots_beds_id: service?.slots_beds ?? null,
        slots_beds: service?.slots_beds
            ? (await configService.getServiceOptionsById(service.slots_beds))?.name ?? ""
            : "",

        client_slots: service?.total_available_slots ?? null,
        client_slots_available: service?.slots_available ?? null,

        start_day_of_service: service?.start_day_of_service
            ? new Date(service.start_day_of_service).toISOString().split("T")[0]
            : "",

        service_limited: service?.service_limited ?? false,
        enrollment_type_id: service?.enrollment_type ?? null,
        enrollment_type: service?.enrollment_type
            ? TimePeriod[service.enrollment_type] ?? ""
            : "",

        enrollment_period: service?.enrollment_period ?? null,
        extension: service?.extension ?? false,
        waitlist: service?.waitlist ?? false,

        service_description: service?.service_description ?? "",
        minimum_age: service?.minimum_age ?? null,
        maximum_age: service?.maximum_age ?? null,

        genders_served: await safeOptionsArray(service?.genders_served),
        served_to: await safeOptionsArray(service?.served_to),

        minimum_children_age: service?.minimum_children_age ?? null,
        maximum_children_age: service?.maximum_children_age ?? null,
        maximum_children_intake: service?.maximum_children_intake ?? null,

        citizenship_requirement: await safeOptionsArray(service?.citizenship_requirement),
        language_requirement: await safeOptionsArray(service?.language_requirement),

        out_of_state_relocation: service?.out_of_state_relocation ?? false,

        trafficking_status: await safeOptionsArray(service?.trafficking_status),
        legal: await safeOptionsArray(service?.legal),
        health_needs: await safeOptionsArray(service?.health_needs),
        medications: await safeOptionsArray(service?.medications),
        mental_health_diagnoses: await safeOptionsArray(service?.mental_health_diagnoses),
        physical_accommodations: await safeOptionsArray(service?.physical_accommodations),

        medication_others: service?.medication_others ?? null,
        mental_health_diagnoses_others: service?.mental_health_diagnoses_others ?? null,
        physical_accommodations_others: service?.physical_accommodations_others ?? null,

        smoking_allowed: await safeOptionsArray(service?.smoking_allowed),
        entry_requirement: await safeOptionsArray(service?.entry_requirement),

        days_sober: service?.days_sober ?? "",

        service_model: await safeOptionsArray(service?.service_model),

        faith_engagement_id: service?.faith_engagement ?? null,
        faith_engagement: service?.faith_engagement
            ? (await configService.getServiceOptionsById(service.faith_engagement))?.name ?? ""
            : "",
        faith_engagement_practice: service?.faith_engagement_practice ?? "",

        service_structure_id: service?.service_structure ?? null,
        service_structure: service?.service_structure
            ? (await configService.getServiceOptionsById(service.service_structure))?.name ?? ""
            : "",

        sleeping_arrangement_id: service?.sleeping_arrangement ?? null,
        sleeping_arrangement: service?.sleeping_arrangement
            ? (await configService.getServiceOptionsById(service.sleeping_arrangement))?.name ?? ""
            : "",

        staffing_level_id: service?.staffing_level ?? null,
        staffing_level: service?.staffing_level
            ? (await configService.getServiceOptionsById(service.staffing_level))?.name ?? ""
            : "",

        teams_diversity: await safeOptionsArray(service?.teams_diversity),
        service_guidelines: await safeOptionsArray(service?.service_guidelines),
        support_provided: await safeOptionsArray(service?.support_provided),
        support_offered: await safeOptionsArray(service?.support_offered),

        intake_process: service?.intake_process ?? "",
        additional_requirements: service?.additional_requirements ?? "",
        reason_for_removal: service?.reason_for_removal ?? "",

        is_submitted: service?.is_submitted ?? false,
    };
}

export async function getOrganizationsDetails(organization: any, filter?: string, role?: number) {
    const ids = organization.organization.primary_purpose.map(id => Number(id));
    const purposes = await configService.getPrimaryPurposeById(ids);
    return {
        id: organization.organization.id,
        is_active: filter || "",
        under_review: organization.organization.under_review ?? "",
        name: organization.organization.name,
        email: organization.email,
        country_code: organization.country_code,
        phone_no: organization.mobile,
        disclose_address: organization.organization.disclose_address,
        zipcode: organization.organization.zipcode,
        website: organization.organization.website,
        year: organization.organization.year,
        address: organization.organization.address,
        street: organization.organization.street,
        city: organization.organization.city,
        state_id: organization.organization.state?.id,
        state: organization.organization.state?.name,
        primary_purpose: purposes.map(purpose => ({
            id: purpose.id,
            name: purpose.name,
        })),
        advocate: await organizationService.countOrganizationAdvocate(organization.organization.id),
        services: await organizationService.countOrganizationServices(organization.organization.id),
        tax_status: organization.organization.tax_exemption == false ? "No" : "Yes",
        ein: organization.organization.ein,
        affiliation: role == Constants.ROLE_ADMIN ? (organization.organization.affiliations
            // .filter((item: any) => item.is_active === false)
            .map((item: any) => {
            const fileUrl = item.affiliation_file;
            let type = "";

            if (fileUrl) {
                const parts = fileUrl.split(".");
                type = parts[parts.length - 1].toUpperCase();
            }
            return {
                id: item.affiliation.id,
                name: item.affiliation.name,
                file: fileUrl,
                size: item.file_size,
                approved: item.is_active,
                type
            };
        })) : (organization.organization.affiliations
            .filter((item: any) => item.is_active === true)
            .map((item: any) => {
                const fileUrl = item.affiliation_file;
                let type = "";

                if (fileUrl) {
                    const parts = fileUrl.split(".");
                    type = parts[parts.length - 1].toUpperCase();
                }
                return {
                    id: item.affiliation.id,
                    name: item.affiliation.name,
                    file: fileUrl,
                    size: item.file_size,
                    type
                };
            }))
    }
}

export async function getUserDetails(user: any) {
    if (user.role.id === Constants.ROLE_ORGANIZATION_ADMIN || user.role.id === Constants.ROLE_ADVOCATE) {
        const getClients = await organizationService.getOrganizationClientsByUserId(user.id);
        return {
            id: user.id,
            username: user.username,
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email: user.email,
            phone_no: user.mobile,
            country_code: user.country_code,
            role: user.role.name == 'organization' ? 'Organization Admin' : user.role.name == 'service_manager' ? 'Service Manager' : user.role.name == 'advocate' ? 'Advocate' : user.role.name,
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
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email: user.email,
            phone_no: user.mobile,
            country_code: user.country_code,
            role: user.role.name == 'organization' ? 'Organization Admin' : user.role.name == 'service_manager' ? 'Service Manager' : user.role.name == 'advocate' ? 'Advocate' : user.role.name,
            services: await Promise.all(
                getServices.map(async (item) => ({
                    id: item.id,
                    name: item.name || "",
                    service_type: (await configService.getServiceOptionsById(item.service_type)).name,
                    address: !item.disclose_address == true ? `${item.address} ${item.street} ${item.city} ${item.state != null ? item.state.name : ""} ${item.zipcode}` : "",
                }))
            ),
            created_at: new Date(user.created_at).toISOString().split('T')[0],
        }
    }
    return {
        id: user.id,
        username: user.username,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email,
        phone_no: user.mobile,
        country_code: user.country_code,
        role: user.role.name == 'organization' ? 'Organization Admin' : user.role.name == 'service_manager' ? 'Service Manager' : user.role.name == 'advocate' ? 'Advocate' : user.role.name,
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

    const customResponse = await Promise.all(
        data.map(async (service: any) => {
        const user = await userService.findById(service.user.id);
        const type = roleTypeMap[user.role.id];

        const base = {
            type,
            id: service.id,
            service_id: service.service.id,
            service: service.service.name,
            date_time: service.created_at,
            service_request: service.status,
            client_service_id: service.client_service.id,
            user: service.user.id,
            status: {
                id: service.status,
                name: statusMap[service.status] ?? "UNKNOWN",
            },
        };
        if (type === "survivor") {
            return {
                ...base,
                client_name: user.user_name,
                client_email: user.email,
            };
        }
        return {
            ...base,
            case_no: service.case_no,
            requested_by: `${user.first_name} ${user.last_name}`,
            requested_email: user.email,
        };
    }))

    return {
        current_page: page_number,
        page_size,
        total_items: total,
        total_pages: Math.ceil(total / page_size),
        data: customResponse
    };
}

export async function getServiceRequestDetails(serviceRequestsId: number) {
    const service = await clientService.getServiceRequestById(serviceRequestsId);
    if (!service) throw new Error("Service request not found");

    const user = await userService.findById(service.user.id);
    const clients = await advocateService.getClientsById(service.id);
    const type = roleTypeMap[user.role.id];

    const base = {
        type,
        id: service.id,
        service_id: service.service.id,
        service: service.service.name,
        date_time: service.created_at,
        service_request: service.status,
        client_service_id: service.client_service.id,
        user: service.user.id,
        status: {
            id: service.status,
            name: statusMap[service.status] ?? "UNKNOWN",
        },
    };

    const isSurvivor = user.role.id === Constants.ROLE_SURVIVOR;

    const client = isSurvivor
        ? {
            ...base,
            client_name: user.user_name,
            client_email: user.email,
        }
        : {
            ...base,
            case_no: service.case_no,
            requested_by: `${user.first_name} ${user.last_name}`,
            requested_email: user.email,
        };

    const form = await getClientDetails(
        clients,
        isSurvivor ? Constants.ROLE_SURVIVOR : Constants.ROLE_ADVOCATE
    );

    return {
        client,
        form,
    };
}


export async function removeOrganizationUser(organization_id: number, user_id: number, email: string, user: number, role_id: number) {

    const checkIfValidUser = await organizationService.checkIfOrganizationUser(user_id, organization_id);
    if (!checkIfValidUser) {
        throw new Error("User not found in organization")
    }

    if (checkIfValidUser.role.id != role_id) {
        throw new Error("Not a valid user type")
    }

    const checkIfEmail = await organizationService.checkIfEmailIsRoleUser(email, user_id, organization_id, role_id);

    if (!checkIfEmail) {
        if (role_id === Constants.ROLE_ORGANIZATION_ADMIN) {
            throw new Error("Email provided is not an organization admin")
        }
        if (role_id === Constants.ROLE_SERVICE_MANAGER) {
            throw new Error("Email provided is not a service manager")
        }
        if (role_id === Constants.ROLE_ADVOCATE) {
            throw new Error("Email provided is not an advocate")
        }
    }

    //     replace service manager from service settings
    if (role_id == Constants.ROLE_SERVICE_MANAGER) {
        const removeServiceManagerFromSettings = await organizationService.removeUserFromSettings(user_id, checkIfEmail.id);
        if (!removeServiceManagerFromSettings) {
            throw new Error("Can't remove service manager from service settings. Try again later")
        }
    }

    //     replace service request
    const removeAdvocateServiceRequest = await organizationService.removeUserServiceRequest(user_id, checkIfEmail.id);
    if (!removeAdvocateServiceRequest) {
        throw new Error("Can't remove user from service request. Try again later")
    }

    //     replace client
    const removeAdvocateClients = await organizationService.removeUserClients(user_id, checkIfEmail.id);
    if (!removeAdvocateClients) {
        throw new Error("Can't remove user from clients. Try again later")
    }

    //     replace service details
    const removeAdvocateServiceDetails = await organizationService.removeServiceDetails(user_id, checkIfEmail.id);
    if (!removeAdvocateServiceDetails) {
        throw new Error("Can't remove service details. Try again later")
    }

    // remove reported user
    const removeReportedUser = await organizationService.removeReportedUser(user_id, user);
    if (!removeReportedUser) {
        throw new Error("Can't remove reported user. Try again later")
    }

    // remove reported service
    const removeReportedService = await organizationService.removeReportedService(user_id, user);
    if (!removeReportedService) {
        throw new Error("Can't remove reported service. Try again laterr")
    }

    // delete password reset
    await userService.passwordResetDelete(user_id)

    // delete device token
    await userService.deleteDeviceTokenForAllUser(user_id)

    //     delete organization admin
    const deleteOrganizationAdmin = await userService.deleteUser(user_id, role_id);
    if (!deleteOrganizationAdmin) {
        throw new Error("Can't remove organization admin. Try again later")
    }
}

export const safeOption = async (id?: number) => {
    if (!id) return null;
    const opt = await configService.getServiceOptionsById(id);
    return opt ? { id, name: opt.name, icon: opt.icon } : null;
};

export const safeOptionsArray = async (arr?: number[]) => {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    return Promise.all(
        arr.map(async (id) => {
            const opt = await configService.getServiceOptionsById(id);
            return opt ? { id, name: opt.name } : null;
        })
    ).then(res => res.filter(Boolean));
};

