export type ProjectStatus = 'draft' | 'published';

export type CategoryId =
    | 'ecommerce'
    | 'realestate'
    | 'medical'
    | 'education'
    | 'restaurant'
    | 'travel'
    | 'wedding'
    | 'legal'
    | 'fitness'
    | 'saas'
    | 'personal';

export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    provider: string;
    createdAt: string;
    updatedAt: string;
}

export interface Project {
    id: string;
    userId: string;
    title: string;
    category: CategoryId;
    status: ProjectStatus;
    puckData: PuckData | null;
    inputData: Record<string, unknown> | null;
    thumbnailUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PuckData {
    content: PuckComponent[];
    root: {
        props: Record<string, unknown>;
    };
}

export interface PuckComponent {
    type: string;
    props: Record<string, unknown> & { id: string };
}

export interface Category {
    id: CategoryId;
    name: string;
    description: string;
    icon: string;
    inputSchema: CategoryInputField[];
    sortOrder: number;
    isActive: boolean;
}

export interface CategoryInputField {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'tags';
    required: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
}

export interface GenerationLog {
    id: string;
    projectId: string;
    userId: string;
    prompt: string;
    category: CategoryId;
    inputData: Record<string, unknown>;
    outputData: PuckData;
    modelVersion: string;
    tokensUsed: number;
    createdAt: string;
}

export interface VibeSession {
    id: string;
    projectId: string;
    userId: string;
    message: string;
    response: string;
    changesApplied: Record<string, unknown>;
    createdAt: string;
}

export interface ApiResponse<T = unknown> {
    ok: true;
    data: T;
}

export interface ApiError {
    ok: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}

export type ApiResult<T = unknown> = ApiResponse<T> | ApiError;
