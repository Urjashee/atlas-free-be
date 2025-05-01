import AppDataSource from "../../ormconfig";
import {Users} from "../entity/Users";
import {Profiles} from "../entity/Profiles";
import {getRepository} from "typeorm";

export class OrganizationService {
    private userRepository = AppDataSource.getRepository(Users);
    private profileRepository = AppDataSource.getRepository(Profiles);

    async getOrganizations(filter: string) {
        if (filter === "all") {

        }
        if (filter === "pending") {
            const organizations = await this.userRepository.find({
                where: {
                    is_active: false,
                    is_status: true
                }
            })
            if (organizations.length > 0) {
                const orgIds = organizations.map(org => org.id);

                return await this.profileRepository
                    .createQueryBuilder("profile")
                    .leftJoinAndSelect("profile.user", "user")
                    .leftJoinAndMapMany(
                        "profile.affiliation",
                        "Affiliations",
                        "affiliation",
                        "affiliation.user.id = user.id"
                    )
                    .leftJoinAndSelect("affiliation.affiliation", "registrationOption")
                    .where("user.id IN (:...ids)", { ids: orgIds })
                    .getMany()
            }
        }
    }
}
