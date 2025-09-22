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
exports.ServiceDetails = exports.StaffDiversity = exports.Guidelines = exports.Faith = exports.SubstanceRecovery = exports.Structure = exports.TimePeriod = void 0;
const typeorm_1 = require("typeorm");
const Users_entity_1 = require("./Users.entity");
const UserRole_entity_1 = require("./UserRole.entity");
const Organization_entity_1 = require("./Organization.entity");
const State_entity_1 = require("./State.entity");
var TimePeriod;
(function (TimePeriod) {
    TimePeriod[TimePeriod["Days"] = 1] = "Days";
    TimePeriod[TimePeriod["Months"] = 2] = "Months";
    TimePeriod[TimePeriod["Years"] = 3] = "Years";
})(TimePeriod || (exports.TimePeriod = TimePeriod = {}));
var Structure;
(function (Structure) {
    Structure[Structure["Individualized (adaptable schedule and programing)"] = 1] = "Individualized (adaptable schedule and programing)";
    Structure[Structure["Pre-determined program (more daily structure and curriculum based)"] = 2] = "Pre-determined program (more daily structure and curriculum based)";
})(Structure || (exports.Structure = Structure = {}));
var SubstanceRecovery;
(function (SubstanceRecovery) {
    SubstanceRecovery[SubstanceRecovery["Clean and sober requirement"] = 1] = "Clean and sober requirement";
    SubstanceRecovery[SubstanceRecovery["Harm reduction model (participants may still be using substances)"] = 2] = "Harm reduction model (participants may still be using substances)";
})(SubstanceRecovery || (exports.SubstanceRecovery = SubstanceRecovery = {}));
var Faith;
(function (Faith) {
    Faith[Faith["Faith-based with required participation"] = 1] = "Faith-based with required participation";
    Faith[Faith["Faith-based without required participation"] = 2] = "Faith-based without required participation";
    Faith[Faith["No faith affiliation"] = 3] = "No faith affiliation";
})(Faith || (exports.Faith = Faith = {}));
var Guidelines;
(function (Guidelines) {
    Guidelines[Guidelines["Daily curfew"] = 1] = "Daily curfew";
    Guidelines[Guidelines["Initial blackout period (no phone, no internet, etc)"] = 2] = "Initial blackout period (no phone, no internet, etc)";
})(Guidelines || (exports.Guidelines = Guidelines = {}));
var StaffDiversity;
(function (StaffDiversity) {
    StaffDiversity[StaffDiversity["Survivors of human trafficking/sex trade on staff"] = 1] = "Survivors of human trafficking/sex trade on staff";
    StaffDiversity[StaffDiversity["BIPOC (Black, Indigenous, and People of Color) on staff"] = 2] = "BIPOC (Black, Indigenous, and People of Color) on staff";
    StaffDiversity[StaffDiversity["Bilingual or Multilingual staff"] = 3] = "Bilingual or Multilingual staff";
    StaffDiversity[StaffDiversity["Gender and sexual minorities on staff"] = 4] = "Gender and sexual minorities on staff";
    StaffDiversity[StaffDiversity["People with disabilities on staff"] = 5] = "People with disabilities on staff";
})(StaffDiversity || (exports.StaffDiversity = StaffDiversity = {}));
let ServiceDetails = class ServiceDetails {
};
exports.ServiceDetails = ServiceDetails;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ServiceDetails.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Organization_entity_1.Organization, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'organization_id' }),
    __metadata("design:type", Organization_entity_1.Organization)
], ServiceDetails.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], ServiceDetails.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ServiceDetails.prototype, "street", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ServiceDetails.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => State_entity_1.State, (state) => state.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "state_id" }),
    __metadata("design:type", State_entity_1.State)
], ServiceDetails.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ServiceDetails.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ServiceDetails.prototype, "zipcode", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ServiceDetails.prototype, "disclose_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ServiceDetails.prototype, "is_organization_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], ServiceDetails.prototype, "service_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ServiceDetails.prototype, "total_available_slots", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ServiceDetails.prototype, "slots_beds", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 0 }),
    __metadata("design:type", Number)
], ServiceDetails.prototype, "slots_available", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ServiceDetails.prototype, "start_day_of_service", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: true }),
    __metadata("design:type", Boolean)
], ServiceDetails.prototype, "service_limited", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: TimePeriod, nullable: true }),
    __metadata("design:type", Number)
], ServiceDetails.prototype, "enrollment_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ServiceDetails.prototype, "enrollment_period", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: true }),
    __metadata("design:type", Boolean)
], ServiceDetails.prototype, "extension", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: true }),
    __metadata("design:type", Boolean)
], ServiceDetails.prototype, "waitlist", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "longtext", nullable: true }),
    __metadata("design:type", String)
], ServiceDetails.prototype, "service_description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ServiceDetails.prototype, "minimum_age", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ServiceDetails.prototype, "maximum_age", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceDetails.prototype, "genders_served", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceDetails.prototype, "served_to", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ServiceDetails.prototype, "minimum_children_age", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ServiceDetails.prototype, "maximum_children_age", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ServiceDetails.prototype, "maximum_children_intake", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceDetails.prototype, "citizenship_requirement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceDetails.prototype, "language_requirement", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: true }),
    __metadata("design:type", Boolean)
], ServiceDetails.prototype, "out_of_state_relocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceDetails.prototype, "trafficking_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceDetails.prototype, "legal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceDetails.prototype, "health_needs", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceDetails.prototype, "medications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceDetails.prototype, "mental_health_diagnoses", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceDetails.prototype, "physical_accommodations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceDetails.prototype, "smoking_allowed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceDetails.prototype, "entry_requirement", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ServiceDetails.prototype, "days_sober", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceDetails.prototype, "service_model", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ServiceDetails.prototype, "faith_engagement", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ServiceDetails.prototype, "faith_engagement_practice", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ServiceDetails.prototype, "service_structure", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ServiceDetails.prototype, "sleeping_arrangement", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ServiceDetails.prototype, "staffing_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceDetails.prototype, "teams_diversity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceDetails.prototype, "service_guidelines", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceDetails.prototype, "support_provided", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceDetails.prototype, "support_offered", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "longtext", nullable: true }),
    __metadata("design:type", String)
], ServiceDetails.prototype, "intake_process", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "longtext", nullable: true }),
    __metadata("design:type", String)
], ServiceDetails.prototype, "additional_requirements", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "longtext", nullable: true }),
    __metadata("design:type", String)
], ServiceDetails.prototype, "reason_for_removal", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: false }),
    __metadata("design:type", Boolean)
], ServiceDetails.prototype, "is_submitted", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => UserRole_entity_1.UserRole, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'role_id' }),
    __metadata("design:type", UserRole_entity_1.UserRole)
], ServiceDetails.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Users_entity_1.Users, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    __metadata("design:type", Users_entity_1.Users)
], ServiceDetails.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceDetails.prototype, "service_manager", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ServiceDetails.prototype, "contact_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ServiceDetails.prototype, "contact_phone", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ServiceDetails.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ServiceDetails.prototype, "updated_at", void 0);
exports.ServiceDetails = ServiceDetails = __decorate([
    (0, typeorm_1.Entity)()
], ServiceDetails);
