import AppDataSource from "../../ormconfig";
import {ServiceDetailsOptions} from "../entity/ServiceDetailsOptions.entity";
import {RegistrationOption} from "../entity/RegistrationOption.entity";
import {AdvocateService} from "../entity/AdvocateService.entity";
import {In} from "typeorm";
import {State} from "../entity/State.entity";

export class ConfigService {
    private serviceDetailOptionRepository = AppDataSource.getRepository(ServiceDetailsOptions);
    private registrationOptionRepository = AppDataSource.getRepository(RegistrationOption);
    private advocateServiceRepository = AppDataSource.getRepository(AdvocateService);
    private stateRepository = AppDataSource.getRepository(State);

    async getState() {
        return await this.stateRepository.find()
    }
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

    async getServiceOptionsById(id: number) {
        return await this.serviceDetailOptionRepository.findOne({
            where: {
                id: id
            }
        })
    }

    async getAdvocateService() {
        return await this.advocateServiceRepository.find()
    }

    async getAdvocateServiceById(id: number) {
        return await this.advocateServiceRepository.findOne({
            where: {
                id
            }
        })
    }

    async getPrimaryPurposeById(ids: number[]) {
        return await this.registrationOptionRepository.find({
            where: {
                id: In(ids),
            }
        })
    }
}
