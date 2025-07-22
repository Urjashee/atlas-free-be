import {UserService} from "../services/User.service";
import {OrganizationService} from "../services/Organization.service";
import {ServiceManagerService} from "../services/ServiceManager.service";
import {ClientService} from "../services/Client.service";
import {ResponseFormatter} from "../helper/ResponseFormatter.helper";

const organizationService = new OrganizationService();
const serviceManagerService = new ServiceManagerService();
const clientService = new ClientService();
const userService = new UserService();


export async function addClientService(body: any, role: number) {
    const checkIfOrganization = await organizationService.checkIfOrganization(body.organization_id);
    if (!checkIfOrganization)
        throw new Error('Invalid organization');
    const checkIfAdvocate = await organizationService.checkIfOrganizationUser(body.user_id, role);
    if (!checkIfAdvocate)
        throw new Error('Invalid user');
    const checkIfClient = await organizationService.checkIfOrganizationClient(body.user_id, body.client_id)
    if (!checkIfClient)
        throw new Error('Invalid client');
    const checkIfService = await serviceManagerService.checkIfService(body.service_id);
    if (!checkIfService)
        throw new Error('Invalid service');
    const addService = await clientService.addService(body, body.user_id);
    if (!addService)
        throw new Error("Request can't be sent");

}

export async function reportUser(body: any, user_id: number, organization_id: number) {
    const {type, reported_user, reason} = body;
    if (type == 'survivor') {
        const checkIfSurvivorUser = await userService.checkIfSurvivor(reported_user);
        if (!checkIfSurvivorUser) {
            throw new Error("Not a valid user");
        }
    }
    if (type == 'advocate') {
        const checkIfAdvocateUser = await userService.checkIfAdvocate(reported_user);
        if (!checkIfAdvocateUser) {
            throw new Error("Not a valid advocate user");
        }
    }
    const reportUser = await organizationService.reportUser(type, reported_user, reason, user_id, organization_id);
    if (!reportUser)
        throw new Error("Can't report user, try again later");

}
