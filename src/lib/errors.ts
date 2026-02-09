import { NextResponse } from 'next/server';
import type { ApiError } from '@/types';

export const ErrorCodes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    RATE_LIMIT: 'RATE_LIMIT',
    EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export function createErrorResponse(
    code: string,
    message: string,
    status: number,
    details?: Record<string, unknown>
): NextResponse<ApiError> {
    return NextResponse.json(
        {
            ok: false as const,
            error: { code, message, details },
        },
        { status }
    );
}

export function validationError(message: string, details?: Record<string, unknown>) {
    return createErrorResponse(ErrorCodes.VALIDATION_ERROR, message, 400, details);
}

export function unauthorizedError(message = '로그인이 필요합니다') {
    return createErrorResponse(ErrorCodes.UNAUTHORIZED, message, 401);
}

export function forbiddenError(message = '접근 권한이 없습니다') {
    return createErrorResponse(ErrorCodes.FORBIDDEN, message, 403);
}

export function notFoundError(message = '리소스를 찾을 수 없습니다') {
    return createErrorResponse(ErrorCodes.NOT_FOUND, message, 404);
}

export function rateLimitError(message = '잠시 후 다시 시도해주세요') {
    return createErrorResponse(ErrorCodes.RATE_LIMIT, message, 429);
}

export function externalApiError(message: string, details?: Record<string, unknown>) {
    return createErrorResponse(ErrorCodes.EXTERNAL_API_ERROR, message, 502, details);
}

export function internalError(message = '서버 오류가 발생했습니다') {
    return createErrorResponse(ErrorCodes.INTERNAL_ERROR, message, 500);
}
