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
exports.ServiceDetailsOptions = void 0;
const typeorm_1 = require("typeorm");
const ServiceHeadings_entity_1 = require("./ServiceHeadings.entity");
let ServiceDetailsOptions = class ServiceDetailsOptions {
};
exports.ServiceDetailsOptions = ServiceDetailsOptions;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ServiceDetailsOptions.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ServiceDetailsOptions.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ServiceDetailsOptions.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ServiceDetailsOptions.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ServiceHeadings_entity_1.ServiceHeadings, { eager: true }),
    __metadata("design:type", ServiceHeadings_entity_1.ServiceHeadings)
], ServiceDetailsOptions.prototype, "serviceHeading", void 0);
exports.ServiceDetailsOptions = ServiceDetailsOptions = __decorate([
    (0, typeorm_1.Entity)()
], ServiceDetailsOptions);
