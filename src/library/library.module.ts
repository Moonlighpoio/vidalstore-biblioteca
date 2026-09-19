import { Module } from '@nestjs/common';
import { InMemoryLibraryRepository } from './repositories/in-memory-library.repository';

@Module({
  providers: [
    InMemoryLibraryRepository,
  ],
  exports: [
    InMemoryLibraryRepository,
  ],
})
export class LibraryModule {}