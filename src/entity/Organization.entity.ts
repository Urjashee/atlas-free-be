import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn, OneToOne, OneToMany
} from "typeorm";
import {Users} from "./Users.entity";
import {ServiceDetails} from "./ServiceDetails.entity";
import {Affiliations} from "./Affiliations.entity";

@Entity()
export class Organization {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false })
    name!: string;

    @Column()
    address!: string;

    @Column({default: false})
    disclose_address!: boolean;

    @Column()
    zipcode!: string;

    @Column()
    year!: string;

    @Column()
    website!: string;

    @Column()
    tax_exemption!: boolean;

    @Column()
    ein!: number

    @Column({ type: "simple-array", nullable: true })
    primary_purpose!: number[]

    @Column({ default: 0 })
    is_active!: boolean;

    @Column()
    platform_purpose!: number

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @OneToMany(() => ServiceDetails, organization_service => organization_service.organization, { cascade: true })
    organizationService!: ServiceDetails[];

    @OneToMany(() => Affiliations, affiliation => affiliation.organization)
    affiliations!: Affiliations[];

    @OneToMany(() => Users, user => user.organization)
    users!: Users[];
}
