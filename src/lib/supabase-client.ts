import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const BUCKET = 'campaign-images';
const MAX_FILE_SIZE_MB = 50;

export async function uploadMediaFromClient(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(`Arquivo muito grande (máx ${MAX_FILE_SIZE_MB}MB). Seu arquivo tem ${(file.size / 1024 / 1024).toFixed(0)}MB.`);
  }

  const ext = file.name.split('.').pop() || 'bin';
  const fileName = `campaign-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      contentType: file.type,
      upsert: true,
    });

  if (error) throw new Error(`Upload falhou: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}
