import {AdvocateService} from "../services/Advocate.service";
import {ResponseFormatter} from "../helper/ResponseFormatter.helper";
import {getClientDetails, getServiceRequestsUser} from "./Advocate.util";
import {Constants} from "../helper/Constants.helper";
import {OrganizationService} from "../services/Organization.service";

const advocateService = new AdvocateService();
const organizationService = new OrganizationService();

export async function clients(body: any, user_id: number, organization_id: number) {
    // for (const service of body.service) {
    //
    //     const checkIfValidService = await organizationService.checkIfValidOrganization(service, organization_id);
    //
    //     if (!checkIfValidService) {
    //         throw new Error('Invalid service');
    //     }
    //     if (!checkIfValidService.is_submitted) {
    //         throw new Error('Invalid service');
    //     }
    // }
    if (body.id) {
        const checkIfValidOrganization = await advocateService.checkIfValidClient(body.id, user_id);
        if (!checkIfValidOrganization)
            throw new Error('Invalid client');
        const editClientDetails = await advocateService.editClient(body.id, user_id, organization_id, body)
        if (!editClientDetails)
            throw new Error("Can\'t edit, try again later");
        return "Successfully updated clients."
    } else {
        const addClientDetails = await advocateService.addClient(user_id, organization_id, body)
        if (!addClientDetails)
            throw new Error("Can't add, try again later");
        return "Successfully added clients."
    }
}
export async function getClientsById(client_id: number, user_id: number, organization_id?: number) {
    if (!organization_id) {
        const checkIfValidOrganization = await advocateService.checkIfValidClient(client_id, user_id);
        if (!checkIfValidOrganization)
            throw new Error('Invalid client');
    }

    const getClients = await advocateService.getClientsById(client_id);
    const form = await getClientDetails(getClients, Constants.ROLE_ADVOCATE)
    const getServiceRequests = await organizationService.getServiceRequestsById(client_id);
    const customResponseService = await getServiceRequestsUser(getServiceRequests)
    return {
        form: form,
        service_requests: customResponseService
    }
}
