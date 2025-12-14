import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class CreatePostDTO {
    @IsInt()
    authorId!: number;

    @IsString()
    @MaxLength(100)
    title!: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsBoolean()
    publish?: boolean;
}

export class UpdatePostDTO {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsBoolean()
    publish?: boolean;
}
