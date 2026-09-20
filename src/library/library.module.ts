import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { InMemoryLibraryRepository } from './repositories/in-memory-library.repository';

@Module({
  controllers: [LibraryController],
  providers: [
    LibraryService,
    InMemoryLibraryRepository,
  ],
  exports: [
    LibraryService,
    InMemoryLibraryRepository,
  ],
})
export class LibraryModule {}