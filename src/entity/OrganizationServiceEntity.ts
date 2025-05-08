import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn, OneToOne
} from "typeorm";
import {Users} from "./Users";

export enum TimePeriod {
    "Days" = 1,
    "Months" = 2,
    "Years" = 3,
}
@Entity()
export class OrganizationServiceEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Users, { eager: true })
    @JoinColumn({ name: 'organization_id' })
    organization!: Users;

    @Column({nullable: false})
    name!: string

    @Column({nullable: false})
    service_type!: number

    @Column({nullable: true})
    client_slots!: number

    @Column({nullable: true})
    slots_beds!: number

    @Column({ type: 'timestamp', nullable: true })
    start_day_of_service!: Date | null

    @Column({nullable: true, default: true})
    service_limited!: boolean

    @Column({ type: "enum", enum: TimePeriod, nullable: true })
    enrollment_type!: number

    @Column({nullable: true})
    enrollment_period!: number

    @Column({nullable: true, default: true})
    extension!: boolean

    @Column({nullable: true, default: true})
    waitlist!: boolean

    @Column({type: "longtext", nullable: true})
    service_description!: string

    @Column({nullable: true})
    minimum_age!: number

    @Column({nullable: true})
    maximum_age!: number

    @Column({ type: "simple-array", nullable: true })
    genders_served!: number[];

    @Column({ type: "simple-array", nullable: true })
    served_to!: number[];

    @Column({nullable: true})
    minimum_children_age!: number

    @Column({nullable: true})
    maximum_children_age!: number

    @Column({nullable: true})
    maximum_children_intake!: number

    @Column({ type: "simple-array", nullable: true })
    citizenship_requirement!: number[];

    @Column({ type: "simple-array", nullable: true })
    language_requirement!: number[];

    @Column({nullable: true, default: true})
    out_of_state_relocation!: boolean

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
