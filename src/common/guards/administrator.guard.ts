import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

interface AuthenticatedRequest {
  user?: {
    sub: string;
    groups: string[];
  };
}

@Injectable()
export class AdministratorGuard
  implements CanActivate
{
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException(
        'Authenticated user is required',
      );
    }

    const groups = request.user.groups ?? [];

    if (!groups.includes('administradores')) {
      throw new ForbiddenException(
        'Administrator role required',
      );
    }

    return true;
  }
}