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
exports.ReportService = exports.ClientStatus = exports.ChildrenToAccompany = void 0;
const typeorm_1 = require("typeorm");
const Users_entity_1 = require("./Users.entity");
const Organization_entity_1 = require("./Organization.entity");
const ServiceDetails_entity_1 = require("./ServiceDetails.entity");
var ChildrenToAccompany;
(function (ChildrenToAccompany) {
    ChildrenToAccompany[ChildrenToAccompany["Yes"] = 1] = "Yes";
    ChildrenToAccompany[ChildrenToAccompany["No"] = 2] = "No";
    ChildrenToAccompany[ChildrenToAccompany["Preferred"] = 3] = "Preferred";
})(ChildrenToAccompany || (exports.ChildrenToAccompany = ChildrenToAccompany = {}));
var ClientStatus;
(function (ClientStatus) {
    ClientStatus[ClientStatus["Placed"] = 0] = "Placed";
    ClientStatus[ClientStatus["Pending"] = 1] = "Pending";
    ClientStatus[ClientStatus["Unable to serve"] = 2] = "Unable to serve";
    ClientStatus[ClientStatus["Waitlisted"] = 3] = "Waitlisted";
})(ClientStatus || (exports.ClientStatus = ClientStatus = {}));
let ReportService = class ReportService {
};
exports.ReportService = ReportService;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ReportService.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ReportService.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Organization_entity_1.Organization, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'organization_id' }),
    __metadata("design:type", Organization_entity_1.Organization)
], ReportService.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Users_entity_1.Users, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    __metadata("design:type", Users_entity_1.Users)
], ReportService.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ServiceDetails_entity_1.ServiceDetails, (services) => services.id),
    (0, typeorm_1.JoinColumn)({ name: "service_id" }),
    __metadata("design:type", ServiceDetails_entity_1.ServiceDetails)
], ReportService.prototype, "service", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ReportService.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ReportService.prototype, "updated_at", void 0);
exports.ReportService = ReportService = __decorate([
    (0, typeorm_1.Entity)()
], ReportService);
