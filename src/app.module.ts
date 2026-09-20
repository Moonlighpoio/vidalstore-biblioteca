import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { LibraryModule } from './library/library.module';
import { PurchaseModule } from './purchase/purchase.module';
import { LicensesModule } from './licenses/licenses.module';
import { HealthModule } from './health/health.module'
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    LibraryModule,
    PurchaseModule,
    LicensesModule,
    HealthModule,
    AuditModule,
  ],
})
export class AppModule {}