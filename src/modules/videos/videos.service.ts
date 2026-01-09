import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { randomUUID } from 'crypto';
import { Video, VideoStatus } from './entities/video.entity';
import { S3Service } from './s3.service';
import { CreateVideoDto, UpdateVideoDto, FeedQueryDto } from './dto';

@Injectable()
export class VideosService {
    constructor(
        @InjectRepository(Video)
        private readonly videosRepository: Repository<Video>,
        private readonly s3Service: S3Service,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) { }

    async createVideo(
        userId: string,
        createVideoDto: CreateVideoDto,
    ): Promise<{ video: Video; uploadUrl: string }> {
        const videoId = randomUUID();
        const fileExtension = createVideoDto.filename?.split('.').pop() || 'mp4';
        const key = `videos/${userId}/${videoId}.${fileExtension}`;

        // Create video record
        const video = this.videosRepository.create({
            id: videoId,
            userId,
            title: createVideoDto.title,
            description: createVideoDto.description,
            status: VideoStatus.PROCESSING,
        });
        await this.videosRepository.save(video);

        // Generate signed URL for upload
        const uploadUrl = await this.s3Service.getUploadSignedUrl(
            key,
            createVideoDto.contentType,
        );

        return { video, uploadUrl };
    }

    async findById(id: string): Promise<Video> {
        const video = await this.videosRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!video) {
            throw new NotFoundException('Video not found');
        }
        return video;
    }

    async updateVideo(
        id: string,
        userId: string,
        updateVideoDto: UpdateVideoDto,
    ): Promise<Video> {
        const video = await this.findById(id);
        if (video.userId !== userId) {
            throw new NotFoundException('Video not found');
        }
        Object.assign(video, updateVideoDto);
        return this.videosRepository.save(video);
    }

    async getFeed(
        feedQueryDto: FeedQueryDto,
    ): Promise<{ videos: Video[]; nextCursor: string | null }> {
        const { limit = 20, cursor } = feedQueryDto;

        const queryBuilder = this.videosRepository
            .createQueryBuilder('video')
            .leftJoinAndSelect('video.user', 'user')
            .where('video.status = :status', { status: VideoStatus.READY })
            .orderBy('video.createdAt', 'DESC')
            .take(limit + 1);

        if (cursor) {
            const cursorVideo = await this.videosRepository.findOne({
                where: { id: cursor },
            });
            if (cursorVideo) {
                queryBuilder.andWhere('video.createdAt < :createdAt', {
                    createdAt: cursorVideo.createdAt,
                });
            }
        }

        const videos = await queryBuilder.getMany();
        const hasMore = videos.length > limit;
        if (hasMore) {
            videos.pop();
        }

        return {
            videos,
            nextCursor: hasMore ? videos[videos.length - 1].id : null,
        };
    }

    async incrementView(id: string): Promise<void> {
        const cacheKey = `video:${id}:views`;

        // Increment in Redis
        const cachedCount = await this.cacheManager.get<number>(cacheKey);
        const newCount = (cachedCount || 0) + 1;
        await this.cacheManager.set(cacheKey, newCount, 60000); // 1 minute TTL

        // Batch sync to DB every 10 views
        if (newCount % 10 === 0) {
            await this.videosRepository.increment({ id }, 'viewCount', 10);
            await this.cacheManager.set(cacheKey, 0, 60000);
        }
    }

    async confirmUpload(id: string, userId: string): Promise<Video> {
        const video = await this.findById(id);
        if (video.userId !== userId) {
            throw new NotFoundException('Video not found');
        }

        const key = `videos/${userId}/${id}.mp4`;
        video.videoUrl = this.s3Service.getPublicUrl(key);
        video.status = VideoStatus.READY;

        return this.videosRepository.save(video);
    }
}
