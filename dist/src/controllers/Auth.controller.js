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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.AuthController = void 0;
const routing_controllers_1 = require("routing-controllers");
const ResponseFormatter_helper_1 = require("../helper/ResponseFormatter.helper");
const dotenv_1 = __importDefault(require("dotenv"));
const joi_1 = __importDefault(require("joi"));
const MulterConfig_helper_1 = require("../helper/MulterConfig.helper");
const User_service_1 = require("../services/User.service");
const Constants_helper_1 = require("../helper/Constants.helper");
const S3UploadService_helper_1 = __importDefault(require("../helper/S3UploadService.helper"));
const Jwt_helper_1 = require("../helper/Jwt.helper");
const crypto_1 = require("crypto");
const Email_service_1 = require("../services/Email.service");
const Emails_helper_1 = require("../helper/Emails.helper");
dotenv_1.default.config();
const registrationOrganizationSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(150).required(),
    email: joi_1.default.string().email().pattern(/^\S+$/).required(),
    country_code: joi_1.default.string().min(2).max(5).required(),
    phone_no: joi_1.default.string().pattern(/^\d+$/).min(6).max(16).required(),
    street: joi_1.default.string().min(3).max(1600).required(),
    address: joi_1.default.string().min(3).max(1600).required(),
    state: joi_1.default.number().required(),
    city: joi_1.default.string().min(3).max(100).required(),
    disclose_address: joi_1.default.boolean().required(),
    zipcode: joi_1.default.string().min(4).max(10).required(),
    year: joi_1.default.string().min(4).max(5).required(),
    website: joi_1.default.string().min(4).max(100).required(),
    tax_exemption: joi_1.default.number().min(0).max(1).required(),
    ein: joi_1.default.string().min(5).max(30).required(),
    primary_purpose: joi_1.default.array().items(joi_1.default.number()).required(),
    platform_purpose: joi_1.default.number().required(),
    // affiliation_license: Joi.array().items(Joi.number()).required(),
    affiliations: joi_1.default.string().required(),
});
const registrationSurvivor = joi_1.default.object({
    username: joi_1.default.string().required(),
    email: joi_1.default.string().pattern(/^\S+$/).required(),
    password: joi_1.default.string().required(),
});
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().pattern(/^\S+$/).required(),
    password: joi_1.default.string().required(),
    device_token: joi_1.default.string().allow(null, ""),
    device_type: joi_1.default.string().valid("web").required(),
});
const forgotPasswordSchema = joi_1.default.object({
    email: joi_1.default.string().email().pattern(/^\S+$/).required(),
});
const logoutSchema = joi_1.default.object({
    device_token: joi_1.default.string(),
});
const verificationSchema = joi_1.default.object({
    user_id: joi_1.default.string().required(),
    verification_code: joi_1.default.string().required(),
});
const updatePasswordSchema = joi_1.default.object({
    token: joi_1.default.string().required(),
    type: joi_1.default.number().required(),
    password: joi_1.default.string()
        .min(8) // At least 8 characters
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$')) // At least one uppercase, one lowercase, one number
        .required()
        .messages({
        'string.min': 'Password must be at least 8 characters long.',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
        'any.required': 'Password is required.',
    }),
});
const createPasswordSchema = joi_1.default.object({
    token: joi_1.default.string().required(),
    first_name: joi_1.default.string().required(),
    last_name: joi_1.default.string().required(),
    title: joi_1.default.string().required(),
    type: joi_1.default.number().required(),
    country_code: joi_1.default.string().min(2).max(5).required(),
    phone_no: joi_1.default.string().pattern(/^\d+$/).min(6).max(16).required(),
    password: joi_1.default.string()
        .min(8) // At least 8 characters
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$')) // At least one uppercase, one lowercase, one number
        .required()
        .messages({
        'string.min': 'Password must be at least 8 characters long.',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
        'any.required': 'Password is required.',
    }),
});
let AuthController = class AuthController {
    constructor() {
        this.userService = new User_service_1.UserService();
        this.s3UploadService = new S3UploadService_helper_1.default();
        this.jwtHelper = new Jwt_helper_1.JwtHelper();
        this.mailerService = new Email_service_1.EmailService();
    }
    registerOrganization(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Request body is undefined.');
                }
                const { error } = registrationOrganizationSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const existingUser = yield this.userService.findByEmail(req.body.email);
                if (existingUser) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Email already in use');
                }
                const roleId = Constants_helper_1.Constants.ROLE_ORGANIZATION_ADMIN;
                const user = yield this.userService.createUser(req.body, roleId);
                if (user)
                    return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'User created');
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'User created');
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    registerSurvivor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Request body is undefined.');
                }
                const { error } = registrationSurvivor.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const existingUser = yield this.userService.findByEmail(req.body.email);
                if (existingUser) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Email already in use');
                }
                const roleId = Constants_helper_1.Constants.ROLE_SURVIVOR;
                const user = yield this.userService.createSurvivor(req.body, roleId);
                if (user)
                    return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'User created');
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'User created');
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    login(req, res, user_type) {
        return __awaiter(this, void 0, void 0, function* () {
            const { error } = loginSchema.validate(req.body);
            if (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            const roleId = Constants_helper_1.roleMap[user_type];
            console.log("user_type: ", user_type);
            console.log("roleId: ", roleId);
            const checkIfAdmin = yield this.userService.checkIfValidRole(req.body.email, roleId);
            if (!checkIfAdmin)
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, `Not an ${user_type} user`);
            try {
                const checkIsEmail = yield this.userService.checkIfEmail(req.body.email);
                if (!checkIsEmail)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Not a valid email!');
                const checkIsEmailVerified = yield this.userService.checkIfVerified(req.body.email);
                if (!checkIsEmailVerified)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'User email is not verified');
                const checkIsActive = yield this.userService.checkIfActive(req.body.email);
                if (!checkIsActive)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'User is not active');
                const user = yield this.userService.findUserByCredentials(req.body.email, req.body.password);
                if (!user)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Your credentials are wrong', user);
                const token = yield this.jwtHelper.jwtSign(user, user.organization);
                const updateToken = yield this.userService.addToken(user, token, req.body);
                if (!updateToken)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Can't login right now");
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'Login success', token);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    forgotPassword(req, res, body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = forgotPasswordSchema.validate(body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const { email } = body;
                const existingUser = yield this.userService.findByEmail(email);
                if (!existingUser)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Email address is unverified or does not exist');
                if (existingUser) {
                    const type = Constants_helper_1.Constants.FORGOT_PASSWORD;
                    const checkEmailExpiry = yield this.userService.checkEmailExpiry(email, type);
                    if (checkEmailExpiry) {
                        return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Password reset link already sent. You can send a new reset password link only after 5 minutes');
                    }
                    const token = (0, crypto_1.randomBytes)(32).toString('hex');
                    const sendRequest = yield this.userService.sendPasswordResetRequest(email, type, token);
                    if (sendRequest) {
                        const emailContent = (0, Emails_helper_1.PasswordResetEmail)(email, token, type, existingUser.role.id);
                        const mailOptions = {
                            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                            to: email,
                            subject: "Email from Atlas free!",
                            html: emailContent
                        };
                        yield this.mailerService.sendEmail(mailOptions);
                        return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Reset request sent successfully");
                    }
                }
                else {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Email address is unverified or does not exist');
                }
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    createPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = createPasswordSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const { token, password, type } = req.body;
                const passwordResetToken = yield this.userService.findByToken(token);
                if (!passwordResetToken)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Token not found');
                const createPassword = yield this.userService.createPassword(passwordResetToken.email, password, type, passwordResetToken, req.body);
                if (!createPassword)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Password couldn't be created. Try again later");
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Password created successfully!");
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    updatePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = updatePasswordSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const { token, password } = req.body;
                const passwordResetToken = yield this.userService.findByToken(token);
                if (passwordResetToken) {
                    const checkPasswordLinkExpiry = yield this.userService.checkPasswordExpiry(token);
                    if (checkPasswordLinkExpiry)
                        return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Password link has expired");
                    const checkPreviousPassword = yield this.userService.checkPreviousPassword(passwordResetToken.email, password);
                    if (!checkPreviousPassword) {
                        return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Password is same as the previous one");
                    }
                    else {
                        const updatePassword = yield this.userService.updatePassword(passwordResetToken.email, password, passwordResetToken);
                        console.log(updatePassword);
                        if (!updatePassword)
                            return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Password couldn't be updated");
                        return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Password updated successfully!");
                    }
                }
                else {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Token doesn't exist");
                }
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    verify(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = verificationSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const { user_id, verification_code } = req.body;
                const checkIfVerified = yield this.userService.checkIfTokenVerified(user_id, verification_code);
                if (checkIfVerified)
                    return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'Email has already been verified!');
                const verifyUser = yield this.userService.findByCode(user_id, verification_code);
                if (!verifyUser) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Your email has not been verified. Please try again later.');
                }
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'Your email has been verified. You can close the tab and login.');
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, routing_controllers_1.Post)("/organization/register"),
    (0, routing_controllers_1.UseBefore)(MulterConfig_helper_1.upload.array("affiliation_files", 10)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerOrganization", null);
__decorate([
    (0, routing_controllers_1.Post)("/survivor/register"),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerSurvivor", null);
__decorate([
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Post)("/:user_type/login"),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("user_type")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, routing_controllers_1.Post)("/forgot-password"),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, routing_controllers_1.Post)("/create-password"),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createPassword", null);
__decorate([
    (0, routing_controllers_1.Post)("/update-password"),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updatePassword", null);
__decorate([
    (0, routing_controllers_1.Post)("/verify"),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify", null);
exports.AuthController = AuthController = __decorate([
    (0, routing_controllers_1.JsonController)("/api/auth")
], AuthController);
