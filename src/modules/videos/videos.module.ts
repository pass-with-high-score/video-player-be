import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { VideoFile } from './entities/video-file.entity';
import { VideosController, FeedController } from './videos.controller';
import { VideosService } from './videos.service';
import { S3Service } from './s3.service';

@Module({
    imports: [TypeOrmModule.forFeature([Video, VideoFile])],
    controllers: [VideosController, FeedController],
    providers: [VideosService, S3Service],
    exports: [VideosService],
})
export class VideosModule { }
