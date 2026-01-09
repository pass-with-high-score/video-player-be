import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class FeedQueryDto {
    @IsInt()
    @Min(1)
    @Max(50)
    @Transform(({ value }) => parseInt(value as string, 10))
    @IsOptional()
    limit?: number = 20;

    @IsString()
    @IsOptional()
    cursor?: string; // video ID for cursor-based pagination
}
