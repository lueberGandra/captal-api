import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum ProjectStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    location: string;

    @Column('decimal', { precision: 10, scale: 2 })
    landArea: number;

    @Column('decimal', { precision: 15, scale: 2 })
    estimatedCost: number;

    @Column('decimal', { precision: 15, scale: 2 })
    expectedRevenue: number;

    @Column({ nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: ProjectStatus,
        default: ProjectStatus.PENDING
    })
    status: ProjectStatus;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    createdById: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'createdById' })
    createdBy: User;
} 
