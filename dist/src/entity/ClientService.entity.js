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
exports.ClientService = exports.ChildrenToAccompany = void 0;
const typeorm_1 = require("typeorm");
const Users_entity_1 = require("./Users.entity");
const Organization_entity_1 = require("./Organization.entity");
var ChildrenToAccompany;
(function (ChildrenToAccompany) {
    ChildrenToAccompany[ChildrenToAccompany["Yes"] = 1] = "Yes";
    ChildrenToAccompany[ChildrenToAccompany["No"] = 2] = "No";
    ChildrenToAccompany[ChildrenToAccompany["Preferred"] = 3] = "Preferred";
})(ChildrenToAccompany || (exports.ChildrenToAccompany = ChildrenToAccompany = {}));
let ClientService = class ClientService {
};
exports.ClientService = ClientService;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ClientService.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Organization_entity_1.Organization, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'organization_id' }),
    __metadata("design:type", Organization_entity_1.Organization)
], ClientService.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Users_entity_1.Users, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    __metadata("design:type", Users_entity_1.Users)
], ClientService.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Users_entity_1.Users, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: "client_id" }),
    __metadata("design:type", Users_entity_1.Users)
], ClientService.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ClientService.prototype, "service", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ClientService.prototype, "client_nick_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ClientService.prototype, "zipcode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ClientService.prototype, "dob", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ClientService.prototype, "english_speaking_ability", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ClientService.prototype, "preferred_language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ClientService.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ClientService.prototype, "race", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ClientService.prototype, "citizenship_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ClientService.prototype, "client_experienced", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], ClientService.prototype, "pregnant", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ClientService.prototype, "pregnant_months", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ClientService.prototype, "birthdate_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ChildrenToAccompany, nullable: true }),
    __metadata("design:type", Number)
], ClientService.prototype, "children_accompany", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ClientService.prototype, "children_to_accompany", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ClientService.prototype, "criteria", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ClientService.prototype, "criteria_add", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ClientService.prototype, "medications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ClientService.prototype, "mental_health_diagnoses", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ClientService.prototype, "physical_accommodation", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ClientService.prototype, "specify_physical_accommodation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ClientService.prototype, "nicotine_products", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ClientService.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ClientService.prototype, "updated_at", void 0);
exports.ClientService = ClientService = __decorate([
    (0, typeorm_1.Entity)()
], ClientService);
