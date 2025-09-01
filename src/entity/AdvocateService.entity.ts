import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn} from "typeorm";
import {ServiceHeadings} from "./ServiceHeadings.entity";

@Entity()
export class AdvocateService {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 500 })
    name!: string;

    @Column()
    type!: string;
}
