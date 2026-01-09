import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Like } from '../../likes/entities/like.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { VideoFile } from './video-file.entity';

export enum VideoStatus {
    PROCESSING = 'processing',
    READY = 'ready',
    FAILED = 'failed',
}

@Entity('videos')
export class Video {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => User, (user: User) => user.videos)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    videoUrl: string;

    @Column({ nullable: true })
    thumbnailUrl: string;

    @Column({ type: 'int', default: 0 })
    duration: number;

    @Column({ type: 'enum', enum: VideoStatus, default: VideoStatus.PROCESSING })
    status: VideoStatus;

    @Column({ type: 'int', default: 0 })
    viewCount: number;

    @Column({ type: 'int', default: 0 })
    likeCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => VideoFile, (file: VideoFile) => file.video)
    files: VideoFile[];

    @OneToMany(() => Like, (like: Like) => like.video)
    likes: Like[];

    @OneToMany(() => Comment, (comment: Comment) => comment.video)
    comments: Comment[];
}
