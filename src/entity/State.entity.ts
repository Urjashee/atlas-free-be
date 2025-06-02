import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class State {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;
}
