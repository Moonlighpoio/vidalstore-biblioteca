import {
  Controller,
  Get,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    groups: string[];
  };
}

@Controller('biblioteca')
export class LibraryController {
  @Get()
  findOwnLibrary(
    @Req() request: AuthenticatedRequest,
  ) {
    return {
      message: 'Library endpoint ready',
      user: request.user ?? null,
    };
  }
}