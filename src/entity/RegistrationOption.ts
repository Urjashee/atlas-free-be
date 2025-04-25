import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn} from "typeorm";
import {ServiceHeadings} from "./ServiceHeadings";

@Entity()
export class RegistrationOption {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    type!: string;
}
