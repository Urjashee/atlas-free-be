import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class ServiceHeadings {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;
}
