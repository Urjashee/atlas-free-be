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
exports.ReportUser = exports.UserType = void 0;
const typeorm_1 = require("typeorm");
const Users_entity_1 = require("./Users.entity");
const Organization_entity_1 = require("./Organization.entity");
var UserType;
(function (UserType) {
    UserType["Survivor"] = "survivor";
    UserType["Advocate"] = "advocate";
})(UserType || (exports.UserType = UserType = {}));
let ReportUser = class ReportUser {
};
exports.ReportUser = ReportUser;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ReportUser.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ReportUser.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: UserType, nullable: true }),
    __metadata("design:type", String)
], ReportUser.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Organization_entity_1.Organization, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'organization_id' }),
    __metadata("design:type", Organization_entity_1.Organization)
], ReportUser.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Users_entity_1.Users, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: "reported_user_id" }),
    __metadata("design:type", Users_entity_1.Users)
], ReportUser.prototype, "reported_user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Users_entity_1.Users, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: "reported_by_id" }),
    __metadata("design:type", Users_entity_1.Users)
], ReportUser.prototype, "reported_by", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ReportUser.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ReportUser.prototype, "updated_at", void 0);
exports.ReportUser = ReportUser = __decorate([
    (0, typeorm_1.Entity)()
], ReportUser);
