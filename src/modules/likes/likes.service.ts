import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Like } from './entities/like.entity';
import { Video } from '../videos/entities/video.entity';

@Injectable()
export class LikesService {
    constructor(
        @InjectRepository(Like)
        private readonly likesRepository: Repository<Like>,
        @InjectRepository(Video)
        private readonly videosRepository: Repository<Video>,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) { }

    async like(userId: string, videoId: string): Promise<{ liked: boolean }> {
        const existingLike = await this.likesRepository.findOne({
            where: { userId, videoId },
        });

        if (existingLike) {
            return { liked: true };
        }

        const like = this.likesRepository.create({ userId, videoId });
        await this.likesRepository.save(like);

        // Update like count
        await this.videosRepository.increment({ id: videoId }, 'likeCount', 1);

        // Invalidate cache
        await this.cacheManager.del(`video:${videoId}:likes`);

        return { liked: true };
    }

    async unlike(userId: string, videoId: string): Promise<{ liked: boolean }> {
        const result = await this.likesRepository.delete({ userId, videoId });

        if (result.affected && result.affected > 0) {
            await this.videosRepository.decrement({ id: videoId }, 'likeCount', 1);
            await this.cacheManager.del(`video:${videoId}:likes`);
        }

        return { liked: false };
    }

    async isLiked(userId: string, videoId: string): Promise<boolean> {
        const like = await this.likesRepository.findOne({
            where: { userId, videoId },
        });
        return !!like;
    }

    async getVideoLikeCount(videoId: string): Promise<number> {
        const cacheKey = `video:${videoId}:likes`;
        const cached = await this.cacheManager.get<number>(cacheKey);

        if (cached !== undefined && cached !== null) {
            return cached;
        }

        const video = await this.videosRepository.findOne({
            where: { id: videoId },
        });
        const count = video?.likeCount || 0;

        await this.cacheManager.set(cacheKey, count, 300000); // 5 minutes TTL
        return count;
    }
}
