import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class UserRole {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;
}
