"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMap = exports.Constants = void 0;
class Constants {
}
exports.Constants = Constants;
Constants.ROLE_ADMIN = 1;
Constants.ROLE_ORGANIZATION_ADMIN = 2;
Constants.ROLE_SERVICE_MANAGER = 3;
Constants.ROLE_ADVOCATE = 4;
Constants.ROLE_SURVIVOR = 5;
Constants.CREATE_PASSWORD = 1;
Constants.EMAIL_PASSWORD_REST = 2;
Constants.ACTIVATE_ORGANIZATION = 3;
Constants.FORGOT_PASSWORD = 4;
Constants.SEND_INVITATION = 5;
Constants.RESEND_INVITATION = 6;
Constants.VERIFY_EMAIL = 7;
Constants.PAGE_NUMBER = 1;
Constants.PAGE_SIZE = 20;
Constants.PLACED = 0;
Constants.PENDING = 1;
Constants.UNABLE_TO_SERVE = 2;
Constants.WAITLISTED = 3;
exports.roleMap = {
    "admin": Constants.ROLE_ADMIN,
    "organization_admin": Constants.ROLE_ORGANIZATION_ADMIN,
    "service_manager": Constants.ROLE_SERVICE_MANAGER,
    "advocate": Constants.ROLE_ADVOCATE,
    "survivor": Constants.ROLE_SURVIVOR
};
