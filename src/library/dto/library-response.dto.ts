import { License } from '../entities/license.entity';

export class LibraryResponseDto {
  userId: string;
  licenses: License[];
  total: number;
}