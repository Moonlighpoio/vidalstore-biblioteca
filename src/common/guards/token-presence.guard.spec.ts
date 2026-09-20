import {
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenPresenceGuard } from './token-presence.guard';

describe('TokenPresenceGuard', () => {
  let guard: TokenPresenceGuard;

  beforeEach(() => {
    guard = new TokenPresenceGuard();
  });

  function createContext(request: object) {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  }

  it('should allow a request with x-user-sub', () => {
    const request: Record<string, unknown> = {
      headers: {
        'x-user-sub': 'user-player-001',
        'x-user-groups': 'jugadores',
      },
    };

    const result = guard.canActivate(
      createContext(request),
    );

    expect(result).toBe(true);
    expect(request.user).toEqual({
      sub: 'user-player-001',
      groups: ['jugadores'],
    });
  });

  it('should parse multiple groups', () => {
    const request: Record<string, unknown> = {
      headers: {
        'x-user-sub': 'user-admin-001',
        'x-user-groups':
          'jugadores, editores, administradores',
      },
    };

    const result = guard.canActivate(
      createContext(request),
    );

    expect(result).toBe(true);
    expect(request.user).toEqual({
      sub: 'user-admin-001',
      groups: [
        'jugadores',
        'editores',
        'administradores',
      ],
    });
  });

  it('should reject a request without x-user-sub', () => {
    const request = {
      headers: {},
    };

    expect(() =>
      guard.canActivate(createContext(request)),
    ).toThrow(UnauthorizedException);
  });

  it('should reject an empty x-user-sub', () => {
    const request = {
      headers: {
        'x-user-sub': '',
      },
    };

    expect(() =>
      guard.canActivate(createContext(request)),
    ).toThrow(UnauthorizedException);
  });

  it('should allow a request without groups', () => {
    const request: Record<string, unknown> = {
      headers: {
        'x-user-sub': 'user-player-001',
      },
    };

    const result = guard.canActivate(
      createContext(request),
    );

    expect(result).toBe(true);
    expect(request.user).toEqual({
      sub: 'user-player-001',
      groups: [],
    });
  });
});