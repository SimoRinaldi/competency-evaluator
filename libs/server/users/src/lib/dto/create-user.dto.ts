import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";
import { UserRole } from './user-role.enum';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    @Matches(/[?^!#@]/, { message: 'Password must contain at least one symbol among ? ^ ! # @' })
    // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[?^!#@]).{8,}$/, {
    //    message:
    //        'Password troppo debole: min 8 caratteri, maiuscola, minuscola, numero e simbolo (? ^ ! # @)',
    // })
    password: string;

    @IsEnum(UserRole, {
        message: 'Valid role required among USER or ADMIN'
    })
    role: UserRole;
};

