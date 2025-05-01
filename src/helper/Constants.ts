export class Constants {
    static ROLE_ADMIN = 1
    static ROLE_ORGANIZATION = 2
    static ROLE_SERVICE_MANAGER = 3
    static ROLE_ADVOCATE = 4
    static ROLE_SURVIVOR = 5
}

export const roleMap: { [key: string]: number } = {
    "admin": Constants.ROLE_ADMIN,
    "organization": Constants.ROLE_ORGANIZATION,
    "service_manager": Constants.ROLE_SERVICE_MANAGER,
    "advocate": Constants.ROLE_ADVOCATE,
    "survivor": Constants.ROLE_SURVIVOR
};
