import { ApiProperty } from '@nestjs/swagger/dist/decorators';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SigninDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}
