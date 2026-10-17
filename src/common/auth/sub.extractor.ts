import { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: {
    sub: string;
    groups: string[];
  };
}

const decodeBase64Url = (value: string): string =>
  Buffer.from(
    value.replace(/-/g, '+').replace(/_/g, '/'),
    'base64',
  ).toString('utf-8');

export function extractSubFromToken(authorization?: string): string | undefined {
  if (!authorization) {
    return undefined;
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return undefined;
  }

  const parts = token.split('.');

  if (parts.length !== 3) {
    return undefined;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1])) as {
      sub?: string;
    };

    return typeof payload.sub === 'string' ? payload.sub : undefined;
  } catch {
    return undefined;
  }
}

export function resolveRequestSub(request: RequestWithUser): string | undefined {
  const fromToken = extractSubFromToken(request.headers.authorization);

  if (fromToken) {
    return fromToken;
  }

  const headerSub = request.headers['x-user-sub'];

  if (typeof headerSub === 'string' && headerSub.length > 0) {
    return headerSub;
  }

  return request.user?.sub;
}
