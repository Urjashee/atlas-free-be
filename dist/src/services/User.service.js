"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const ormconfig_1 = __importDefault(require("../../ormconfig"));
const Users_entity_1 = require("../entity/Users.entity");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const DeviceToken_entity_1 = require("../entity/DeviceToken.entity");
const Constants_helper_1 = require("../helper/Constants.helper");
const Affiliations_entity_1 = require("../entity/Affiliations.entity");
const S3UploadService_helper_1 = __importDefault(require("../helper/S3UploadService.helper"));
const PasswordReset_entity_1 = require("../entity/PasswordReset.entity");
const typeorm_1 = require("typeorm");
const Organization_entity_1 = require("../entity/Organization.entity");
const crypto_1 = require("crypto");
const Emails_helper_1 = require("../helper/Emails.helper");
const Email_service_1 = require("./Email.service");
class UserService {
    constructor() {
        this.userRepository = ormconfig_1.default.getRepository(Users_entity_1.Users);
        this.organizationRepository = ormconfig_1.default.getRepository(Organization_entity_1.Organization);
        this.deviceTokenRepository = ormconfig_1.default.getRepository(DeviceToken_entity_1.DeviceToken);
        this.affiliationRepository = ormconfig_1.default.getRepository(Affiliations_entity_1.Affiliations);
        this.passwordResetRepository = ormconfig_1.default.getRepository(PasswordReset_entity_1.PasswordReset);
        this.s3UploadService = new S3UploadService_helper_1.default;
        this.mailerService = new Email_service_1.EmailService();
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findOne({
                where: {
                    email
                }
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findOne({
                where: {
                    id
                }
            });
        });
    }
    createUser(body, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this.organizationRepository.create({
                street: body.street,
                address: body.address,
                state: body.state,
                city: body.city,
                name: body.name,
                disclose_address: body.disclose_address,
                zipcode: body.zipcode,
                year: body.year,
                website: body.website,
                tax_exemption: body.tax_exemption,
                ein: body.ein,
                primary_purpose: body.primary_purpose,
                platform_purpose: body.platform_purpose,
                under_review: true,
                is_active: true,
            });
            const org = yield this.organizationRepository.save(profile);
            const user = yield this.userRepository.create({
                email: body.email,
                country_code: body.country_code,
                mobile: body.phone_no,
                is_profile: true,
                is_status: true,
                role: { id: role },
                organization: { id: org.id },
            });
            const savedUser = yield this.userRepository.save(user);
            const affiliations = JSON.parse(body.affiliations);
            for (const affiliation of affiliations) {
                const base64Data = affiliation.file.replace(/^data:application\/pdf;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                const fileSizeBytes = buffer.length;
                const fileSizeKB = (fileSizeBytes / 1024).toFixed(2);
                const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
                const uploadedFile = yield this.s3UploadService.uploadPdfFile(buffer, "affiliation_file");
                if (uploadedFile) {
                    const addAffiliation = yield this.affiliationRepository.create({
                        organization: { id: org.id },
                        affiliation: { id: affiliation.id },
                        affiliation_file: uploadedFile,
                        file_size: fileSizeKB + " KB",
                    });
                    yield this.affiliationRepository.save(addAffiliation);
                }
            }
            return savedUser;
        });
    }
    createSurvivor(body, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.create({
                email: body.email,
                user_name: body.username,
                password: yield bcryptjs_1.default.hash(body.password, 10),
                is_profile: true,
                is_status: true,
                role: { id: role },
            });
            const token = (0, crypto_1.randomBytes)(32).toString('hex');
            const saved_user = yield this.userRepository.save(user);
            const password_reset_request = this.passwordResetRepository.create({
                email: body.email,
                token,
                type: Constants_helper_1.Constants.VERIFY_EMAIL,
                user: { id: saved_user.id }
            });
            yield this.passwordResetRepository.save(password_reset_request);
            const emailContent = (0, Emails_helper_1.VerifyEmail)(body.username, saved_user.id, token, Constants_helper_1.Constants.VERIFY_EMAIL, Constants_helper_1.Constants.ROLE_SURVIVOR);
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: body.email,
                subject: "Email from Atlas free!",
                html: emailContent
            };
            yield this.mailerService.sendEmail(mailOptions);
            return saved_user;
        });
    }
    updateUser(organization_id, body, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOne({
                where: {
                    organization: { id: organization_id },
                }
            });
            if (user) {
                user.country_code = body.country_code;
                user.mobile = body.mobile;
                yield this.userRepository.save(user);
            }
            const organization = yield this.organizationRepository.findOne({
                where: {
                    id: organization_id
                }
            });
            if (organization) {
                organization.street = body.street;
                organization.address = body.address;
                organization.state = body.state;
                organization.city = body.city;
                organization.disclose_address = body.disclose_address;
                organization.zipcode = body.zipcode;
                organization.year = body.year;
                organization.website = body.website;
                organization.tax_exemption = body.tax_exemption;
                organization.primary_purpose = body.primary_purpose;
                organization.under_review = true;
                yield this.organizationRepository.save(organization);
            }
            const currentAffiliations = yield this.affiliationRepository.find({
                where: {
                    organization: { id: organization_id }
                },
            });
            const oldIds = currentAffiliations.map(affiliation => affiliation.affiliation.id);
            const affiliations = JSON.parse(body.affiliations);
            const newIds = affiliations.map(a => a.id);
            console.log("oldIds3: ", oldIds);
            console.log("newIds3: ", newIds);
            const toRemove = currentAffiliations.filter(a => !newIds.includes(a.affiliation.id));
            if (toRemove.length) {
                yield this.affiliationRepository.remove(toRemove);
            }
            for (const affiliation of affiliations) {
                console.log("affiliation: ", affiliation.id);
                const affiliationData = yield this.affiliationRepository.findOne({
                    where: {
                        organization: { id: organization_id },
                        affiliation: { id: affiliation.id },
                    },
                });
                if (affiliationData) {
                    const base64Data = affiliation.file.replace(/^data:application\/pdf;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');
                    const fileSizeBytes = buffer.length;
                    const fileSizeKB = (fileSizeBytes / 1024).toFixed(2);
                    const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
                    const uploadedFile = yield this.s3UploadService.uploadPdfFile(buffer, "affiliation_file");
                    if (uploadedFile) {
                        affiliationData.affiliation_file = uploadedFile;
                        affiliationData.file_size = fileSizeKB + " KB";
                        yield this.affiliationRepository.save(affiliationData);
                    }
                }
                else {
                    const base64Data = affiliation.file.replace(/^data:application\/pdf;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');
                    const fileSizeBytes = buffer.length;
                    const fileSizeKB = (fileSizeBytes / 1024).toFixed(2);
                    const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
                    const uploadedFile = yield this.s3UploadService.uploadPdfFile(buffer, "affiliation_file");
                    if (uploadedFile) {
                        const addAffiliation = yield this.affiliationRepository.create({
                            organization: { id: organization_id },
                            affiliation: { id: affiliation.id },
                            affiliation_file: uploadedFile,
                            file_size: fileSizeKB + " KB",
                        });
                        yield this.affiliationRepository.save(addAffiliation);
                    }
                }
                if (role === Constants_helper_1.Constants.ROLE_ORGANIZATION_ADMIN) {
                    organization.is_active = false;
                    yield this.organizationRepository.save(organization);
                }
            }
            return true;
        });
    }
    checkIfEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findOne({
                where: {
                    email
                }
            });
        });
    }
    checkIfVerified(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOneBy({ email });
            if (user.emailVerifiedAt == null) {
                return false;
            }
            else {
                return true;
            }
        });
    }
    checkIfActive(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOneBy({ email });
            if (user.is_active != true) {
                return false;
            }
            else {
                return true;
            }
        });
    }
    findUserByCredentials(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOne({
                where: {
                    email,
                }, relations: ["organization"]
            });
            if (user && (yield bcryptjs_1.default.compare(password, user.password))) {
                return user;
            }
            return null;
        });
    }
    addToken(user, token, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const userToken = this.deviceTokenRepository.create({
                device_token: body.device_token,
                device_type: body.device_type,
                token: token,
                user: user.id,
            });
            return yield this.deviceTokenRepository.save(userToken);
        });
    }
    checkIfValidRole(email, role) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findOne({
                where: {
                    email: email,
                    role: { id: role },
                }
            });
        });
    }
    checkEmailExpiry(email, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const verifyUser = yield this.passwordResetRepository.findOne({
                where: { email, type, active: true, createdAt: (0, typeorm_1.MoreThan)(fiveMinutesAgo) }
            });
            if (verifyUser) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    sendPasswordResetRequest(email, type, token, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOne({ where: { email } });
            if (user) {
                const password_reset_request = this.passwordResetRepository.create({
                    email, token, type, user: { id: user_id }
                });
                return yield this.passwordResetRepository.save(password_reset_request);
            }
        });
    }
    findByToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.passwordResetRepository.findOne({ where: { token, active: true } });
        });
    }
    checkPasswordExpiry(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const getToken = yield this.passwordResetRepository.findOne({
                where: { token },
            });
            if (getToken) {
                const expiryTime = new Date(getToken.createdAt);
                expiryTime.setHours(expiryTime.getHours() + 2);
                const currentTime = new Date();
                if (currentTime > expiryTime) {
                    return true;
                }
                else {
                    return false;
                }
            }
            return false;
        });
    }
    checkPreviousPassword(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOne({ where: { email } });
            const isMatch = yield bcryptjs_1.default.compare(password, user.password);
            if (isMatch) {
                return false;
            }
            return true;
        });
    }
    updatePassword(email, password, passwordResetToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOne({
                where: {
                    email,
                    emailVerifiedAt: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()),
                }
            });
            if (user) {
                user.password = yield bcryptjs_1.default.hash(password, 10);
                passwordResetToken.active = true;
                yield this.passwordResetRepository.save(passwordResetToken);
                return yield this.userRepository.save(user);
            }
        });
    }
    createPassword(email, password, type, passwordResetToken, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOne({
                where: {
                    email,
                }
            });
            if (user) {
                user.password = yield bcryptjs_1.default.hash(password, 10);
                user.first_name = body.first_name;
                user.last_name = body.last_name;
                user.title = body.title;
                user.country_code = body.country_code;
                user.mobile = body.phone_no;
                user.is_active = true;
                user.emailVerifiedAt = new Date();
                passwordResetToken.active = false;
                yield this.passwordResetRepository.save(passwordResetToken);
                const resetPasswords = yield this.passwordResetRepository.find({
                    where: {
                        email,
                        type: Constants_helper_1.Constants.CREATE_PASSWORD
                    }
                });
                for (const reset of resetPasswords) {
                    reset.active = false;
                    yield this.passwordResetRepository.save(reset);
                }
                return yield this.userRepository.save(user);
            }
        });
    }
    checkIfTokenVerified(user_id, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const verifyUser = yield this.passwordResetRepository.findOne({
                where: {
                    token,
                    user: { id: user_id },
                    active: false,
                }
            });
            if (verifyUser) {
                return true;
            }
            return false;
        });
    }
    findByCode(user_id, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const verifyUser = yield this.passwordResetRepository.findOne({ where: { token, user: { id: user_id } } });
            if (verifyUser) {
                const user = yield this.userRepository.findOne({ where: { email: verifyUser.email } });
                if (user) {
                    const id = user.id;
                    user.emailVerifiedAt = new Date();
                    user.is_active = true;
                    verifyUser.active = false;
                    yield this.passwordResetRepository.save(verifyUser);
                    return yield this.userRepository.save(user);
                }
            }
        });
    }
    checkIfSurvivor(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findOne({
                where: {
                    id: user_id,
                    role: { id: Constants_helper_1.Constants.ROLE_SURVIVOR },
                }
            });
        });
    }
    checkIfAdvocate(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findOne({
                where: {
                    id: user_id,
                    role: { id: Constants_helper_1.Constants.ROLE_ADVOCATE },
                }
            });
        });
    }
    updateUserProfile(user_id, username, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOne({
                where: {
                    id: user_id
                }
            });
            if (user) {
                user.user_name = username;
                user.email = email;
                return yield this.userRepository.save(user);
            }
            return null;
        });
    }
    passwordResetDelete(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const password_resets = yield this.passwordResetRepository.find({
                where: {
                    user: { id: user_id }
                }
            });
            if (password_resets) {
                for (const password_reset of password_resets) {
                    yield this.passwordResetRepository.delete(password_reset.id);
                }
            }
        });
    }
    deleteDeviceTokenForAllUser(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const device_tokens = yield this.deviceTokenRepository.find({
                where: {
                    user: { id: user_id }
                }
            });
            if (device_tokens) {
                for (const device of device_tokens) {
                    yield this.deviceTokenRepository.delete(device.id);
                }
            }
        });
    }
    deleteUser(user_id, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.userRepository.find({
                where: {
                    id: user_id,
                    role: { id: role }
                }
            });
            if (users) {
                for (const user of users) {
                    yield this.userRepository.remove(user);
                }
                return true;
            }
            return false;
        });
    }
}
exports.UserService = UserService;
