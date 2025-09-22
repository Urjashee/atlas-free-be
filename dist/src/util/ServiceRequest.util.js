"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clients = clients;
exports.getClientsById = getClientsById;
const Advocate_service_1 = require("../services/Advocate.service");
const Advocate_util_1 = require("./Advocate.util");
const Constants_helper_1 = require("../helper/Constants.helper");
const Organization_service_1 = require("../services/Organization.service");
const advocateService = new Advocate_service_1.AdvocateService();
const organizationService = new Organization_service_1.OrganizationService();
function clients(body, user_id, organization_id) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const checkIfValidOrganization = yield advocateService.checkIfValidClient(body.id, user_id);
            if (!checkIfValidOrganization)
                throw new Error('Invalid client');
            const editClientDetails = yield advocateService.editClient(body.id, user_id, organization_id, body);
            if (!editClientDetails)
                throw new Error("Can\'t edit, try again later");
            return "Successfully updated clients.";
        }
        else {
            const addClientDetails = yield advocateService.addClient(user_id, organization_id, body);
            if (!addClientDetails)
                throw new Error("Can't add, try again later");
            return "Successfully added clients.";
        }
    });
}
function getClientsById(client_id, user_id, organization_id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!organization_id) {
            const checkIfValidOrganization = yield advocateService.checkIfValidClient(client_id, user_id);
            if (!checkIfValidOrganization)
                throw new Error('Invalid client');
        }
        const getClients = yield advocateService.getClientsById(client_id);
        const form = yield (0, Advocate_util_1.getClientDetails)(getClients, Constants_helper_1.Constants.ROLE_ADVOCATE);
        const getServiceRequests = yield organizationService.getServiceRequestsById(client_id);
        const customResponseService = yield (0, Advocate_util_1.getServiceRequestsUser)(getServiceRequests);
        return {
            form: form,
            serviceRequests: customResponseService
        };
    });
}
