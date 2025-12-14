import { IsEmail, IsInt, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';

class CreatePostDTO {
    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    content?: string;
}

export class CreateUserDTO {
    @IsString()
    name!: string;

    @IsInt()
    @Min(0)
    age!: number;

    @IsEmail()
    @IsString()
    email!: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreatePostDTO)
    postsToCreate?: CreatePostDTO[];
}

export class UpdateUserDTO {
    @IsOptional()
    @IsString()
    name?: string;
    
    @IsOptional()
    @Min(0)
    @IsInt()
    age?: number;
    
    @IsOptional()
    @IsEmail()
    @IsString()
    email?: string;
}
