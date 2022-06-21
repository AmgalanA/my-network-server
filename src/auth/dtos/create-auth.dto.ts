import { IsEmail, IsString } from 'class-validator';

export class createAuthDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;

  @IsString()
  readonly name: string;

  @IsString()
  readonly secondName: string;
}
