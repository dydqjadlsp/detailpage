import { describe, it, expect } from 'vitest';
import {
  ErrorCodes,
  createErrorResponse,
  validationError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
  rateLimitError,
  externalApiError,
  internalError,
} from '../errors';

describe('ErrorCodes', () => {
  it('contains all expected error code keys', () => {
    expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(ErrorCodes.UNAUTHORIZED).toBe('UNAUTHORIZED');
    expect(ErrorCodes.FORBIDDEN).toBe('FORBIDDEN');
    expect(ErrorCodes.NOT_FOUND).toBe('NOT_FOUND');
    expect(ErrorCodes.RATE_LIMIT).toBe('RATE_LIMIT');
    expect(ErrorCodes.EXTERNAL_API_ERROR).toBe('EXTERNAL_API_ERROR');
    expect(ErrorCodes.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
  });
});

describe('createErrorResponse', () => {
  it('returns correct status code and body structure', async () => {
    const response = createErrorResponse('TEST_CODE', 'test message', 418);
    expect(response.status).toBe(418);

    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('TEST_CODE');
    expect(body.error.message).toBe('test message');
  });

  it('includes details when provided', async () => {
    const details = { field: 'email', reason: 'invalid format' };
    const response = createErrorResponse('ERR', 'msg', 400, details);
    const body = await response.json();
    expect(body.error.details).toEqual(details);
  });
});

describe('validationError', () => {
  it('returns 400 with VALIDATION_ERROR code', async () => {
    const response = validationError('invalid input');
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('invalid input');
  });

  it('passes details through', async () => {
    const details = { field: 'name' };
    const response = validationError('bad', details);
    const body = await response.json();
    expect(body.error.details).toEqual(details);
  });
});

describe('unauthorizedError', () => {
  it('returns 401 with default message', async () => {
    const response = unauthorizedError();
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
    expect(body.error.message).toBeTruthy();
  });

  it('accepts custom message', async () => {
    const response = unauthorizedError('custom unauthorized');
    const body = await response.json();
    expect(body.error.message).toBe('custom unauthorized');
  });
});

describe('forbiddenError', () => {
  it('returns 403 with default message', async () => {
    const response = forbiddenError();
    expect(response.status).toBe(403);

    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('FORBIDDEN');
    expect(body.error.message).toBeTruthy();
  });
});

describe('notFoundError', () => {
  it('returns 404 with default message', async () => {
    const response = notFoundError();
    expect(response.status).toBe(404);

    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toBeTruthy();
  });
});

describe('rateLimitError', () => {
  it('returns 429 with default message', async () => {
    const response = rateLimitError();
    expect(response.status).toBe(429);

    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('RATE_LIMIT');
    expect(body.error.message).toBeTruthy();
  });
});

describe('externalApiError', () => {
  it('returns 502 with EXTERNAL_API_ERROR code', async () => {
    const response = externalApiError('upstream failed');
    expect(response.status).toBe(502);

    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('EXTERNAL_API_ERROR');
    expect(body.error.message).toBe('upstream failed');
  });

  it('passes details through', async () => {
    const details = { provider: 'gemini', statusCode: 503 };
    const response = externalApiError('api down', details);
    const body = await response.json();
    expect(body.error.details).toEqual(details);
  });
});

describe('internalError', () => {
  it('returns 500 with default message', async () => {
    const response = internalError();
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).toBeTruthy();
  });

  it('accepts custom message', async () => {
    const response = internalError('db connection lost');
    const body = await response.json();
    expect(body.error.message).toBe('db connection lost');
  });
});
