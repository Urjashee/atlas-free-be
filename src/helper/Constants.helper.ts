export class Constants {
    static ROLE_ADMIN = 1
    static ROLE_ORGANIZATION_ADMIN = 2
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

    static PENDING = 1
    static PLACED = 4
    static UNABLE_TO_SERVE = 6
    static WAITLISTED = 2
    static CANCELLED = 5
    static ACCEPTED = 3

    static MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

}

export const roleMap: { [key: string]: number } = {
    "admin": Constants.ROLE_ADMIN,
    "organization_admin": Constants.ROLE_ORGANIZATION_ADMIN,
    "service_manager": Constants.ROLE_SERVICE_MANAGER,
    "advocate": Constants.ROLE_ADVOCATE,
    "survivor": Constants.ROLE_SURVIVOR
};
export const statusMap: Record<number, string> = {
    1: "PENDING",
    // 2: "PLACED",
    // 3: "UNABLE_TO_SERVE",
    // 4: "WAITLISTED",
    // 5: "CANCELLED",
    // 6: "ACCEPTED",

    2: "WAITLISTED",
    3: "ACCEPTED",
    4: "PLACED",
    5: "CANCELLED",
    6: "UNABLE_TO_SERVE",
};
export const roleTypeMap = {
    [Constants.ROLE_ORGANIZATION_ADMIN]: "organization_admin",
    [Constants.ROLE_SERVICE_MANAGER]: "service_manager",
    [Constants.ROLE_ADVOCATE]: "advocate",
    [Constants.ROLE_SURVIVOR]: "survivor",
};
