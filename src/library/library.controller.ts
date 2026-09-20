import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { LibraryService } from './library.service';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    groups: string[];
  };
}

@Controller('biblioteca')
export class LibraryController {
  constructor(
    private readonly libraryService: LibraryService,
  ) {}

  @Get()
  findOwnLibrary(
    @Req() request: AuthenticatedRequest,
  ) {
    const userSub = request.user?.sub;

    if (!userSub) {
      throw new UnauthorizedException(
        'Authenticated user is required',
      );
    }

    return this.libraryService.findByUserId(
      userSub,
    );
  }
}