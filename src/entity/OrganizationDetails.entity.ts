import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn, OneToOne
} from "typeorm";
import {Users} from "./Users.entity";

export enum TimePeriod {
    "Days" = 1,
    "Months" = 2,
    "Years" = 3,
}
@Entity()
export class OrganizationDetails {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Users, { eager: true })
    @JoinColumn({ name: 'organization_id' })
    organization!: Users;

    // -------------------------------    General    -----------------------------------

    @Column({nullable: false})
    name!: string

    @Column({nullable: false})
    service_type!: number

    @Column({nullable: true})
    client_slots!: number

    @Column({nullable: true})
    slots_beds!: number

    @Column({nullable: true})
    client_slots_available!: number

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

    // -------------------------------    Demographics    -----------------------------------

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

    // -------------------------------    Eligibility    -----------------------------------

    @Column({ type: "simple-array", nullable: true })
    trafficking_status!: number[];

    @Column({ type: "simple-array", nullable: true })
    legal!: number[];

    @Column({ type: "simple-array", nullable: true })
    health_needs!: number[];

    @Column({ type: "simple-array", nullable: true })
    medications!: number[];

    @Column({ type: "simple-array", nullable: true })
    mental_health_diagnoses!: number[];

    @Column({ type: "simple-array", nullable: true })
    physical_accommodations!: number[];

    @Column({ type: "simple-array", nullable: true })
    smoking_allowed!: number[];

    @Column({ type: "simple-array", nullable: true })
    entry_requirement!: number[];

    @Column({ nullable: true })
    days_sober!: string;

    // -------------------------------    Service Model    -----------------------------------

    @Column({ type: "simple-array", nullable: true })
    service_model!: number[];

    @Column({ nullable: true })
    faith_engagement!: number;

    @Column({ nullable: true })
    faith_engagement_practice!: string;

    @Column({ nullable: true })
    service_structure!: number;

    @Column({ nullable: true })
    sleeping_arrangement!: number;

    @Column({ nullable: true })
    staffing_level!: number;

    @Column({ type: "simple-array", nullable: true })
    teams_diversity!: number[];

    @Column({ type: "simple-array", nullable: true })
    service_guidelines!: number[];

    // -------------------------------    Offerings Intake    -----------------------------------

    @Column({ type: "simple-array", nullable: true })
    support_provided!: number[];

    @Column({ type: "simple-array", nullable: true })
    support_offered!: number[];

    @Column({ type: "longtext", nullable: true })
    intake_process!: string;

    @Column({ type: "longtext", nullable: true })
    additional_requirements!: string;

    @Column({ type: "longtext", nullable: true })
    reason_for_removal!: string;

    @Column({ nullable: true, default: false })
    is_submitted!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
