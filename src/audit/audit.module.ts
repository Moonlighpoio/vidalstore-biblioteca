import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { LicenciasRepositoryModule } from '../licenses/licencias-repository.module';

@Module({
  imports: [LicenciasRepositoryModule],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
