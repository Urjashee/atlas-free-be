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
exports.roleIdToNameMap = void 0;
exports.addClientService = addClientService;
exports.reportUser = reportUser;
exports.getRoleIdByName = getRoleIdByName;
exports.getRoleNameById = getRoleNameById;
const User_service_1 = require("../services/User.service");
const Organization_service_1 = require("../services/Organization.service");
const ServiceManager_service_1 = require("../services/ServiceManager.service");
const Client_service_1 = require("../services/Client.service");
const Constants_helper_1 = require("../helper/Constants.helper");
const organizationService = new Organization_service_1.OrganizationService();
const serviceManagerService = new ServiceManager_service_1.ServiceManagerService();
const clientService = new Client_service_1.ClientService();
const userService = new User_service_1.UserService();
function addClientService(body, role) {
    return __awaiter(this, void 0, void 0, function* () {
        const checkIfOrganization = yield organizationService.checkIfOrganization(body.organization_id);
        if (!checkIfOrganization)
            throw new Error('Invalid organization');
        const checkIfAdvocate = yield organizationService.checkIfOrganizationRoleUser(body.user_id, role);
        if (!checkIfAdvocate)
            throw new Error('Invalid user');
        console.log(body.user_id, body.client_service_id);
        const checkIfClient = yield organizationService.checkIfOrganizationClient(body.user_id, body.client_service_id);
        // console.log(checkIfClient)
        if (!checkIfClient)
            throw new Error('Invalid client');
        const checkIfService = yield serviceManagerService.checkIfService(body.service_id);
        if (!checkIfService)
            throw new Error('Invalid service');
        const addService = yield clientService.addService(body, body.user_id);
        if (!addService)
            throw new Error("Request can't be sent");
    });
}
function reportUser(body, user_id, organization_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const { type, reported_user, reason } = body;
        if (type == 'survivor') {
            const checkIfSurvivorUser = yield userService.checkIfSurvivor(reported_user);
            if (!checkIfSurvivorUser) {
                throw new Error("Not a valid user");
            }
        }
        if (type == 'advocate') {
            const checkIfAdvocateUser = yield userService.checkIfAdvocate(reported_user);
            if (!checkIfAdvocateUser) {
                throw new Error("Not a valid advocate user");
            }
        }
        const reportUser = yield organizationService.reportUser(type, reported_user, reason, user_id, organization_id);
        if (!reportUser)
            throw new Error("Can't report user, try again later");
    });
}
function getRoleIdByName(roleName) {
    return Constants_helper_1.roleMap[roleName];
}
exports.roleIdToNameMap = Object.fromEntries(Object.entries(Constants_helper_1.roleMap).map(([key, value]) => [value, key]));
function getRoleNameById(roleId) {
    return exports.roleIdToNameMap[roleId];
}
