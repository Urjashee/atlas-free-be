import AppDataSource from "../../ormconfig";
import {Users} from "../entity/Users.entity";
import {Organization} from "../entity/Organization.entity";
import {DeviceToken} from "../entity/DeviceToken.entity";
import {Affiliations} from "../entity/Affiliations.entity";
import {PasswordReset} from "../entity/PasswordReset.entity";
import s3UploadService from "../helper/S3UploadService.helper";
import {ServiceDetails} from "../entity/ServiceDetails.entity";
import {ServiceSetting} from "../entity/ServiceSetting.entity";

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

    async checkIfValidService(id: number, organization_id: number, user_id: number) {
        return await this.serviceDetailsRepository.findOne({
            where: {
                id: id,
                organization: {id: organization_id},
                user: {id: user_id},
            }
        })
    }
    async getServiceManagerService(user_id: number) {
        return await this.serviceDetailsRepository.find({
            where: {
                user: {id: user_id},
            }
        })
    }
    async getServiceManagerServiceById(id: number, user_id: number) {
        return await this.serviceDetailsRepository.find({
            where: {
                id,
                user: {id: user_id},
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
