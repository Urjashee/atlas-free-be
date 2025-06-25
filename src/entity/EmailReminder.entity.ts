import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {ServiceDetails} from "./ServiceDetails.entity";

export enum DaysOfWeek {
    "Sunday" = 1,
    "Monday" = 2,
    "Tuesday" = 3,
    "Wednesday" = 4,
    "Thursday" = 5,
    "Friday" = 6,
    "Saturday" = 7,
}

export enum TimeZone {
    "Eastern Standard Time (GMT-4)" = 1,
    "Central Standard Time (GMT-5)" = 2,
    "Mountain Standard Time (GMT-6)" = 3,
    "Pacific Standard Time (GMT-7)" = 4,
    "Alaska Standard Time (GMT-8)" = 5,
    "Hawaii-Aleutian Standard Time (GMT-10)" = 6,
}

@Entity()
export class EmailReminder {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false})
    email!: string;

    @Column({ type: "simple-array", nullable: true })
    day_of_week!: DaysOfWeek[];

    @Column({ nullable: false})
    time!: string;

    @Column({ type: "enum", enum: TimeZone, nullable: true })
    time_zone!: number;

    @ManyToOne(() => ServiceDetails, (services) => services.id)
    @JoinColumn({ name: "service_id" })
    service!: ServiceDetails;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
