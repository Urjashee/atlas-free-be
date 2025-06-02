import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Users} from "./Users.entity";
import {Organization} from "./Organization.entity";
import {ServiceDetails} from "./ServiceDetails.entity";
import {ClientService} from "./ClientService.entity";

export enum ChildrenToAccompany {
    "Yes" = 1,
    "No" = 2,
    "Preferred" = 3,
}

@Entity()
export class AssignedServices {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true, default: 0 })
    status!: number;

    @Column({ nullable: true })
    case_no!: string;

    @ManyToOne(() => Organization, { eager: true })
    @JoinColumn({ name: 'organization_id' })
    organization!: Organization;

    @ManyToOne(() => Users, (user) => user.id)
    @JoinColumn({ name: "advocate_id" })
    advocate!: Users;

    @ManyToOne(() => ClientService, (client) => client.id)
    @JoinColumn({ name: "client_id" })
    client!: ClientService;

    @ManyToOne(() => ServiceDetails, (services) => services.id)
    @JoinColumn({ name: "service_id" })
    service!: ServiceDetails;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
