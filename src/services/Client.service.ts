import AppDataSource from "../../ormconfig";
import {Users} from "../entity/Users.entity";
import {Organization} from "../entity/Organization.entity";
import {PasswordReset} from "../entity/PasswordReset.entity";
import {ServiceDetails} from "../entity/ServiceDetails.entity";
import {AssignedServices} from "../entity/AssignedServices.entity";

export class ClientService {
    private userRepository = AppDataSource.getRepository(Users);
    private organizationRepository = AppDataSource.getRepository(Organization);
    private passwordResetRepository = AppDataSource.getRepository(PasswordReset);
    private serviceDetailsRepository = AppDataSource.getRepository(ServiceDetails);
    private clientServiceRepository = AppDataSource.getRepository(ClientService);
    private assignedServiceRepository = AppDataSource.getRepository(AssignedServices);

    async findExistingServices(organization_id: number, ) {
        const services = await this.assignedServiceRepository.find({

        })
    }

    async addService(body: any) {
        const addService = await this.assignedServiceRepository.create({
            organization:{id: body.organization_id},
            advocate:{id: body.advocate_id},
            client:{id: body.client_id},
            service:{id: body.service_id},
        })

        return await this.assignedServiceRepository.save(addService)
    }

}
