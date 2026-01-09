import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { VideoStatus } from '../entities/video.entity';

export class UpdateVideoDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    videoUrl?: string;

    @IsString()
    @IsOptional()
    thumbnailUrl?: string;

    @IsInt()
    @Min(0)
    @IsOptional()
    duration?: number;

    @IsEnum(VideoStatus)
    @IsOptional()
    status?: VideoStatus;
}
