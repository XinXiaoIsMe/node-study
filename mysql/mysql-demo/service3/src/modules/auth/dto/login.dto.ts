import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class LoginDto {
    @IsString()
    username!: string;

    @IsString()
    password!: string;
}