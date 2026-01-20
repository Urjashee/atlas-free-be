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
import {State} from "./State.entity";

@Entity()
export class Organization {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false })
    name!: string;

    @Column({ nullable: true})
    street!: string;

    @Column({ nullable: true})
    address!: string;

    @ManyToOne(() => State, { nullable: true })
    @JoinColumn({ name: "state_id" })
    state!: State;

    @Column({ nullable: true})
    city!: string;

    @Column({ nullable: true})
    zipcode!: string;

    @Column({default: false})
    disclose_address!: boolean;

    @Column()
    year!: string;

    @Column()
    website!: string;

    @Column()
    tax_exemption!: boolean;

    @Column({nullable: true})
    ein!: number

    @Column({ type: "simple-array", nullable: true })
    primary_purpose!: number[]

    @Column({ default: 0 })
    is_active!: boolean;

    @Column({ default: 0 })
    under_review!: boolean;

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
