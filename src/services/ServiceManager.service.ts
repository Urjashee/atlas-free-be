import AppDataSource from "../../ormconfig";
import {Users} from "../entity/Users.entity";
import {Organization} from "../entity/Organization.entity";
import {DeviceToken} from "../entity/DeviceToken.entity";
import {Affiliations} from "../entity/Affiliations.entity";
import {PasswordReset} from "../entity/PasswordReset.entity";
import s3UploadService from "../helper/S3UploadService.helper";
import {ServiceDetails} from "../entity/ServiceDetails.entity";
import {ServiceSetting} from "../entity/ServiceSetting.entity";
import {Like, Raw} from "typeorm";

export class ServiceManagerService {
    private userRepository = AppDataSource.getRepository(Users);
    private organizationRepository = AppDataSource.getRepository(Organization);
    private deviceTokenRepository = AppDataSource.getRepository(DeviceToken);
    private affiliationRepository = AppDataSource.getRepository(Affiliations);
    private passwordResetRepository = AppDataSource.getRepository(PasswordReset);
    private serviceDetailsRepository = AppDataSource.getRepository(ServiceDetails);
    private serviceSettingRepository = AppDataSource.getRepository(ServiceSetting);
    private s3UploadService = new s3UploadService

    async checkIfService(service_id: number) {
        return await this.serviceDetailsRepository.findOne({
            where: {
                id: service_id,
            }
        })
    }

    async checkIfValidService(service_id: number, organization_id: number, user_id: number) {
        console.log("Checking if valid service", user_id)
        return await this.serviceSettingRepository.findOne({
            where: {
                service: {id: service_id},
                service_manager: Raw(alias => `FIND_IN_SET(:user_id, ${alias}) > 0`, { user_id })
            },
            relations: ["service"]
        })
    }
    async getServiceManagerService(user_id: number) {
        return await this.serviceSettingRepository.find({
            where: {
                service_manager: Raw(alias => `FIND_IN_SET(:user_id, ${alias}) > 0`, { user_id })
            },
            relations: ["service"]
        })
    }
    async getServiceManagerServiceById(id: number, user_id: number) {
        return await this.serviceDetailsRepository.findOne({
            where: {
                id,
            }
        })
    }

    async addServiceSettings(body: any) {
        const serviceSetting = await this.serviceSettingRepository.create({
            service: {id: body.service_id},
            available_slots: body.available_slots,
        })
        return await this.serviceSettingRepository.save(serviceSetting)
    }

    async editServiceSettings(body: any) {
        const serviceSetting = await this.serviceSettingRepository.findOne({
            where: {
                service: {id: body.service_id}
            },
            relations: ["service"]
        })
        // console.log(serviceSetting)
        if (serviceSetting) {
            serviceSetting.available_slots = body.available_slots;
            return await this.serviceSettingRepository.save(serviceSetting);
        } else {
            return false;
        }
    }
}
