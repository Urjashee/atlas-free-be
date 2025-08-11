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
    private serviceDetailsRepository = AppDataSource.getRepository(ServiceDetails);

    async checkIfService(service_id: number) {
        return await this.serviceDetailsRepository.findOne({
            where: {
                id: service_id,
            }
        })
    }

    async checkIfValidService(service_id: number, organization_id: number, user_id: number) {
        console.log("Checking if valid service", user_id)
        return await this.serviceDetailsRepository.findOne({
            where: {
                id: service_id,
                service_manager: Raw(alias => `FIND_IN_SET(:user_id, ${alias}) > 0`, { user_id })
            },
            relations: ["service"]
        })
    }
    async getServiceManagerService(user_id: number) {
        return await this.serviceDetailsRepository.find({
            where: {
                service_manager: Raw(alias => `FIND_IN_SET(:user_id, ${alias}) > 0`, { user_id })
            },
        })
    }
    async getServiceManagerServiceById(id: number, user_id: number) {
        return await this.serviceDetailsRepository.findOne({
            where: {
                id,
            }
        })
    }

    async editServiceSettings(body: any) {
        const serviceSetting = await this.serviceDetailsRepository.findOne({
            where: {
                id: body.service_id
            },
        })
        // console.log(serviceSetting)
        if (serviceSetting) {
            serviceSetting.slots_available = body.available_slots;
            return await this.serviceDetailsRepository.save(serviceSetting);
        } else {
            return false;
        }
    }
}
