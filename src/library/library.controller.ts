import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { LibraryService } from './library.service';
import { TokenPresenceGuard } from '../common/guards/token-presence.guard';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
  };
}

@Controller('v1/biblioteca')
@UseGuards(TokenPresenceGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  findOwnLibrary(@Req() request: AuthenticatedRequest) {
    const userId = request.user?.sub;

    if (!userId) {
      throw new UnauthorizedException('Token subject is required');
    }

    return this.libraryService.findByUserId(userId);
  }
}