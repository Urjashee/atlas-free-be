import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn} from "typeorm";
import {ServiceHeadings} from "./ServiceHeadings.entity";

@Entity()
export class ServiceDetailsOptions {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    type!: string;

    @ManyToOne(() => ServiceHeadings, { eager: true })
    serviceHeading!: ServiceHeadings;
}
