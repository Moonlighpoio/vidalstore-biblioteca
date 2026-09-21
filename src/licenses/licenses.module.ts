import { Module } from '@nestjs/common';
import { LicensesController } from './licenses.controller';
import { LicensesService } from './licenses.service';
import { AuditModule } from '../audit/audit.module';
import { LibraryModule } from '../library/library.module';

@Module({
  imports: [AuditModule, LibraryModule],
  controllers: [LicensesController],
  providers: [LicensesService],
  exports: [LicensesService],
})
export class LicensesModule {}