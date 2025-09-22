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
exports.ServiceSetting = void 0;
const typeorm_1 = require("typeorm");
const ServiceDetails_entity_1 = require("./ServiceDetails.entity");
let ServiceSetting = class ServiceSetting {
};
exports.ServiceSetting = ServiceSetting;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ServiceSetting.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], ServiceSetting.prototype, "available_slots", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], ServiceSetting.prototype, "service_manager", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ServiceSetting.prototype, "contact_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ServiceSetting.prototype, "contact_phone", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ServiceDetails_entity_1.ServiceDetails, (services) => services.id),
    (0, typeorm_1.JoinColumn)({ name: "service_id" }),
    __metadata("design:type", ServiceDetails_entity_1.ServiceDetails)
], ServiceSetting.prototype, "service", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ServiceSetting.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ServiceSetting.prototype, "updated_at", void 0);
exports.ServiceSetting = ServiceSetting = __decorate([
    (0, typeorm_1.Entity)()
], ServiceSetting);
