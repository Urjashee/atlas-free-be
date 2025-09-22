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
exports.EmailReminder = exports.TimeZone = exports.DaysOfWeek = void 0;
const typeorm_1 = require("typeorm");
const ServiceDetails_entity_1 = require("./ServiceDetails.entity");
var DaysOfWeek;
(function (DaysOfWeek) {
    DaysOfWeek[DaysOfWeek["Sunday"] = 1] = "Sunday";
    DaysOfWeek[DaysOfWeek["Monday"] = 2] = "Monday";
    DaysOfWeek[DaysOfWeek["Tuesday"] = 3] = "Tuesday";
    DaysOfWeek[DaysOfWeek["Wednesday"] = 4] = "Wednesday";
    DaysOfWeek[DaysOfWeek["Thursday"] = 5] = "Thursday";
    DaysOfWeek[DaysOfWeek["Friday"] = 6] = "Friday";
    DaysOfWeek[DaysOfWeek["Saturday"] = 7] = "Saturday";
})(DaysOfWeek || (exports.DaysOfWeek = DaysOfWeek = {}));
var TimeZone;
(function (TimeZone) {
    TimeZone[TimeZone["Eastern Standard Time (GMT-4)"] = 1] = "Eastern Standard Time (GMT-4)";
    TimeZone[TimeZone["Central Standard Time (GMT-5)"] = 2] = "Central Standard Time (GMT-5)";
    TimeZone[TimeZone["Mountain Standard Time (GMT-6)"] = 3] = "Mountain Standard Time (GMT-6)";
    TimeZone[TimeZone["Pacific Standard Time (GMT-7)"] = 4] = "Pacific Standard Time (GMT-7)";
    TimeZone[TimeZone["Alaska Standard Time (GMT-8)"] = 5] = "Alaska Standard Time (GMT-8)";
    TimeZone[TimeZone["Hawaii-Aleutian Standard Time (GMT-10)"] = 6] = "Hawaii-Aleutian Standard Time (GMT-10)";
})(TimeZone || (exports.TimeZone = TimeZone = {}));
let EmailReminder = class EmailReminder {
};
exports.EmailReminder = EmailReminder;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmailReminder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], EmailReminder.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array", nullable: true }),
    __metadata("design:type", Array)
], EmailReminder.prototype, "day_of_week", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], EmailReminder.prototype, "time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: TimeZone, nullable: true }),
    __metadata("design:type", Number)
], EmailReminder.prototype, "time_zone", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ServiceDetails_entity_1.ServiceDetails, (services) => services.id),
    (0, typeorm_1.JoinColumn)({ name: "service_id" }),
    __metadata("design:type", ServiceDetails_entity_1.ServiceDetails)
], EmailReminder.prototype, "service", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EmailReminder.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], EmailReminder.prototype, "updated_at", void 0);
exports.EmailReminder = EmailReminder = __decorate([
    (0, typeorm_1.Entity)()
], EmailReminder);
