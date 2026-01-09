import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVideoDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    contentType: string; // e.g., 'video/mp4'

    @IsString()
    @IsOptional()
    filename?: string;
}
