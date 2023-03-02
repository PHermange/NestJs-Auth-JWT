import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class SignupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}
