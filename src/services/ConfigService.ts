import AppDataSource from "../../ormconfig";
import {ServiceDetailsOptions} from "../entity/ServiceDetailsOptions.entity";
import {RegistrationOption} from "../entity/RegistrationOption.entity";
import {AdvocateService} from "../entity/AdvocateService.entity";
import {In} from "typeorm";

export class ConfigService {
    private serviceDetailOptionRepository = AppDataSource.getRepository(ServiceDetailsOptions);
    private registrationOptionRepository = AppDataSource.getRepository(RegistrationOption);
    private advocateServiceRepository = AppDataSource.getRepository(AdvocateService);

    async getPrimaryPurpose() {
        return await this.registrationOptionRepository.find({
            where: {
                type: "primary_purpose"
            }
        })
    }

    async getPlatformPurpose() {
        return await this.registrationOptionRepository.find({
            where: {
                type: "platform_purpose"
            }
        })
    }

    async getAffiliationLicenses() {
        return await this.registrationOptionRepository.find({
            where: {
                type: "affiliations_licenses"
            }
        })
    }

    async getServiceOptions(type: string) {
        return await this.serviceDetailOptionRepository.find({
            where: {
                type: type
            }
        })
    }

    async getAdvocateService() {
        return await this.advocateServiceRepository.find()
    }

    async getPrimaryPurposeById(ids: number[]) {
        return await this.registrationOptionRepository.find({
            where: {
                id: In(ids),
            }
        })
    }
}
