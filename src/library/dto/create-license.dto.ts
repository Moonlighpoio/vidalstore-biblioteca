import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLicenseDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;
}