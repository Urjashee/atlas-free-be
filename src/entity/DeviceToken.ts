import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Users} from "./Users";


@Entity()
export class DeviceToken {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Users,  {eager: true})
    @JoinColumn()
    user!: Users | number;

    @Column({nullable: true})
    device_token!: string;

    @Column()
    device_type!: string;

    @Column({type: "longtext"})
    token!: string;
}
