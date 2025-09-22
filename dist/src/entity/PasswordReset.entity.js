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
exports.PasswordReset = void 0;
const typeorm_1 = require("typeorm");
const Users_entity_1 = require("./Users.entity");
let PasswordReset = class PasswordReset {
};
exports.PasswordReset = PasswordReset;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PasswordReset.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], PasswordReset.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "longtext", nullable: false }),
    __metadata("design:type", String)
], PasswordReset.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "tinyint", nullable: false }),
    __metadata("design:type", Number)
], PasswordReset.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: 1 }),
    __metadata("design:type", Boolean)
], PasswordReset.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Users_entity_1.Users, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    __metadata("design:type", Users_entity_1.Users)
], PasswordReset.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PasswordReset.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PasswordReset.prototype, "updatedAt", void 0);
exports.PasswordReset = PasswordReset = __decorate([
    (0, typeorm_1.Entity)()
], PasswordReset);
