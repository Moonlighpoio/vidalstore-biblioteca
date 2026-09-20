import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenPresenceGuard } from '../common/guards/token-presence.guard';
import { LibraryService } from './library.service';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    groups: string[];
  };
}

@Controller('biblioteca')
@UseGuards(TokenPresenceGuard)
export class LibraryController {
  constructor(
    private readonly libraryService: LibraryService,
  ) {}

  @Get()
  findOwnLibrary(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.libraryService.findByUserId(
      request.user.sub,
    );
  }
}