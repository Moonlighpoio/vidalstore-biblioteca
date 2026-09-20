import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

interface AuthenticatedRequest {
  headers: {
    'x-user-sub'?: string | string[];
    'x-user-groups'?: string | string[];
  };
  user?: {
    sub: string;
    groups: string[];
  };
}

@Injectable()
export class TokenPresenceGuard
  implements CanActivate
{
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    const userSub = this.getHeaderValue(
      request.headers['x-user-sub'],
    );

    if (!userSub) {
      throw new UnauthorizedException(
        'Authenticated user is required',
      );
    }

    request.user = {
      sub: userSub,
      groups: this.parseGroups(
        request.headers['x-user-groups'],
      ),
    };

    return true;
  }

  private getHeaderValue(
    value: string | string[] | undefined,
  ): string | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  }

  private parseGroups(
    value: string | string[] | undefined,
  ): string[] {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    return value
      .split(',')
      .map((group) => group.trim())
      .filter(Boolean);
  }
}