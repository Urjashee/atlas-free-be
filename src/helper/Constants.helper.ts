export class Constants {
    static ROLE_ADMIN = 1
    static ROLE_ORGANIZATION = 2
    static ROLE_SERVICE_MANAGER = 3
    static ROLE_ADVOCATE = 4
    static ROLE_SURVIVOR = 5

    static CREATE_PASSWORD = 1
    static EMAIL_PASSWORD_REST = 2
    static ACTIVATE_ORGANIZATION = 3
    static FORGOT_PASSWORD = 4
    static SEND_INVITATION = 5
    static RESEND_INVITATION = 6
    static VERIFY_EMAIL = 7

    static PAGE_NUMBER = 1
    static PAGE_SIZE = 20

    static PLACED = 0
    static PENDING = 1
    static UNABLE_TO_SERVE = 2
    static WAITLISTED = 3


}

export const roleMap: { [key: string]: number } = {
    "admin": Constants.ROLE_ADMIN,
    "organization_admin": Constants.ROLE_ORGANIZATION,
    "service_manager": Constants.ROLE_SERVICE_MANAGER,
    "advocate": Constants.ROLE_ADVOCATE,
    "survivor": Constants.ROLE_SURVIVOR
};
