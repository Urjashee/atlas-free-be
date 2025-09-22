"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignedServices = exports.ServiceStatus = exports.ClientStatus = exports.ChildrenToAccompany = void 0;
const typeorm_1 = require("typeorm");
const Users_entity_1 = require("./Users.entity");
const Organization_entity_1 = require("./Organization.entity");
const ServiceDetails_entity_1 = require("./ServiceDetails.entity");
const ClientService_entity_1 = require("./ClientService.entity");
var ChildrenToAccompany;
(function (ChildrenToAccompany) {
    ChildrenToAccompany[ChildrenToAccompany["Yes"] = 1] = "Yes";
    ChildrenToAccompany[ChildrenToAccompany["No"] = 2] = "No";
    ChildrenToAccompany[ChildrenToAccompany["Preferred"] = 3] = "Preferred";
})(ChildrenToAccompany || (exports.ChildrenToAccompany = ChildrenToAccompany = {}));
var ClientStatus;
(function (ClientStatus) {
    ClientStatus[ClientStatus["All"] = 0] = "All";
    ClientStatus[ClientStatus["Pending"] = 1] = "Pending";
    ClientStatus[ClientStatus["Placed"] = 2] = "Placed";
    ClientStatus[ClientStatus["Unable to serve"] = 3] = "Unable to serve";
    ClientStatus[ClientStatus["Waitlisted"] = 4] = "Waitlisted";
    ClientStatus[ClientStatus["Cancelled"] = 5] = "Cancelled";
})(ClientStatus || (exports.ClientStatus = ClientStatus = {}));
var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus[ServiceStatus["Open"] = 0] = "Open";
    ServiceStatus[ServiceStatus["Full"] = 1] = "Full";
    ServiceStatus[ServiceStatus["Waitlist only"] = 2] = "Waitlist only";
})(ServiceStatus || (exports.ServiceStatus = ServiceStatus = {}));
let AssignedServices = class AssignedServices {
};
exports.AssignedServices = AssignedServices;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AssignedServices.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 1 }),
    __metadata("design:type", Number)
], AssignedServices.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AssignedServices.prototype, "case_no", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Organization_entity_1.Organization, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'organization_id' }),
    __metadata("design:type", Organization_entity_1.Organization)
], AssignedServices.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Users_entity_1.Users, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    __metadata("design:type", Users_entity_1.Users)
], AssignedServices.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ClientService_entity_1.ClientService, (client) => client.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "client_service_id" }),
    __metadata("design:type", ClientService_entity_1.ClientService)
], AssignedServices.prototype, "client_service", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ServiceDetails_entity_1.ServiceDetails, (services) => services.id),
    (0, typeorm_1.JoinColumn)({ name: "service_id" }),
    __metadata("design:type", ServiceDetails_entity_1.ServiceDetails)
], AssignedServices.prototype, "service", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AssignedServices.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AssignedServices.prototype, "updated_at", void 0);
exports.AssignedServices = AssignedServices = __decorate([
    (0, typeorm_1.Entity)()
], AssignedServices);
