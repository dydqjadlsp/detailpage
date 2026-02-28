import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient, ensureStorageBucket } from '@/lib/supabase/admin';
import {
  unauthorizedError,
  validationError,
  internalError,
} from '@/lib/errors';

const BUCKET = 'reference-images';
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

/**
 * POST /api/upload/reference
 * @description 섹션 빌더에서 참고 이미지를 업로드한다
 */
export async function POST(request: Request) {
  try {
    await ensureStorageBucket(BUCKET);

    const supabase = await createClient();
    if (!supabase) return unauthorizedError();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return unauthorizedError();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return validationError('파일이 필요합니다');
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return validationError('PNG, JPG, WebP, GIF 이미지만 업로드 가능합니다');
    }

    if (file.size > MAX_SIZE) {
      return validationError('파일 크기는 10MB 이하여야 합니다');
    }

    const admin = createAdminClient();
    if (!admin) return internalError('스토리지 클라이언트 초기화 실패');

    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const safeExt = ext.replace(/[^a-zA-Z0-9]/g, '');
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const filePath = `${user.id}/${timestamp}-${random}.${safeExt}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return internalError(`업로드 실패: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = admin.storage.from(BUCKET).getPublicUrl(filePath);

    return NextResponse.json({
      ok: true,
      data: { url: publicUrl },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return internalError(message);
  }
}
