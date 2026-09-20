import { Module } from '@nestjs/common';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';
import { LibraryModule } from '../library/library.module';

@Module({
  imports: [
    LibraryModule,
  ],
  controllers: [
    PurchaseController,
  ],
  providers: [
    PurchaseService,
  ],
  exports: [
    PurchaseService,
  ],
})
export class PurchaseModule {}