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
exports.Organization = void 0;
const typeorm_1 = require("typeorm");
const Users_entity_1 = require("./Users.entity");
const ServiceDetails_entity_1 = require("./ServiceDetails.entity");
const Affiliations_entity_1 = require("./Affiliations.entity");
const State_entity_1 = require("./State.entity");
let Organization = class Organization {
};
exports.Organization = Organization;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Organization.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Organization.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Organization.prototype, "street", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Organization.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => State_entity_1.State, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "state_id" }),
    __metadata("design:type", State_entity_1.State)
], Organization.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Organization.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Organization.prototype, "zipcode", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Organization.prototype, "disclose_address", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Organization.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Organization.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Organization.prototype, "tax_exemption", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Organization.prototype, "ein", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], Organization.prototype, "primary_purpose", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Boolean)
], Organization.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Boolean)
], Organization.prototype, "under_review", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Organization.prototype, "platform_purpose", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Organization.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Organization.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ServiceDetails_entity_1.ServiceDetails, organization_service => organization_service.organization, { cascade: true }),
    __metadata("design:type", Array)
], Organization.prototype, "organizationService", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Affiliations_entity_1.Affiliations, affiliation => affiliation.organization),
    __metadata("design:type", Array)
], Organization.prototype, "affiliations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Users_entity_1.Users, user => user.organization),
    __metadata("design:type", Array)
], Organization.prototype, "users", void 0);
exports.Organization = Organization = __decorate([
    (0, typeorm_1.Entity)()
], Organization);
