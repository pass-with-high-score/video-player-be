import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Video } from './video.entity';

export enum VideoQuality {
    Q240P = '240p',
    Q480P = '480p',
    Q720P = '720p',
    Q1080P = '1080p',
}

@Entity('video_files')
export class VideoFile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    videoId: string;

    @ManyToOne(() => Video, (video: Video) => video.files, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'videoId' })
    video: Video;

    @Column({ type: 'enum', enum: VideoQuality })
    quality: VideoQuality;

    @Column()
    fileUrl: string;

    @Column({ type: 'int', nullable: true })
    fileSize: number;
}
