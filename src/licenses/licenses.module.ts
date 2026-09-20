import { Module } from '@nestjs/common';
import { LibraryModule } from '../library/library.module';
import { LicensesController } from './licenses.controller';
import { LicensesService } from './licenses.service';

@Module({
  imports: [
    LibraryModule,
  ],
  controllers: [
    LicensesController,
  ],
  providers: [
    LicensesService,
  ],
  exports: [
    LicensesService,
  ],
})
export class LicensesModule {}