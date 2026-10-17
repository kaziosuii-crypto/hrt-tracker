import { createClient } from '@supabase/supabase-js';
import { put, del } from '@vercel/blob';
import { timingSafeEqual } from 'node:crypto';
import { createPhotoHandler } from '../../../../../lib/meal-photo-upload.mjs';

export const runtime = 'nodejs';
export const maxDuration = 60;
const options = { auth: { persistSession: false, autoRefreshToken: false } };

function sameSecret(a, b) {
  if (!a || !b) return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(req, context) {
  let db;
  return createPhotoHandler({
    authorize: async (request) => {
      // Server-to-server automation path: no browser session required.
      // The key exists only in Vercel environment variables and must never be exposed client-side.
      const serviceKey = request.headers.get('x-atlas-upload-key') || '';
      if (sameSecret(serviceKey, process.env.ATLAS_UPLOAD_KEY)) {
        db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, options).schema('hrt');
        return 200;
      }

      // Normal browser path: retain the existing Supabase session + owner check.
      const bearer = request.headers.get('authorization') || '';
      if (!bearer.startsWith('Bearer ')) return 401;
      const auth = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, options);
      const { data: { user }, error } = await auth.auth.getUser(bearer.slice(7));
      if (error || !user) return 401;
      if (!process.env.DASHBOARD_ALLOWED_USER_ID || user.id !== process.env.DASHBOARD_ALLOWED_USER_ID) return 403;
      db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, options).schema('hrt');
      return 200;
    },
    findMeal: async (id) => {
      const { data, error } = await db.from('food_logs').select('id,record_date,photo_before_url,photo_after_url').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
    upload: (pathname, bytes, [contentType, ext]) => put(`${pathname}.${ext}`, bytes, { access: 'public', contentType, addRandomSuffix: true }),
    save: async (id, field, url, previous) => {
      let query = db.from('food_logs').update({ [field]: url }).eq('id', id);
      query = previous == null ? query.is(field, null) : query.eq(field, previous);
      const { data, error } = await query.select('id,photo_before_url,photo_after_url').maybeSingle();
      if (error) throw error;
      return data;
    },
    remove: (url) => del(url),
  })(req, context);
}
