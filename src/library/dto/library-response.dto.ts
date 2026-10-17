import { LicenseResponse } from '../library.service';

export class LibraryResponseDto {
  userId: string;
  licenses: LicenseResponse[];
  total: number;
}
