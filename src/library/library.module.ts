import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { GameNamesService } from './game-names.service';
import { LicenciasRepositoryModule } from '../licenses/licencias-repository.module';

@Module({
  imports: [LicenciasRepositoryModule],
  controllers: [LibraryController],
  providers: [LibraryService, GameNamesService],
  exports: [LibraryService, GameNamesService, LicenciasRepositoryModule],
})
export class LibraryModule {}
