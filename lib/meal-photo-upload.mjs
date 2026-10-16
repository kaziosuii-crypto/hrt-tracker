export const MAX_PHOTO_BYTES = 4_000_000;
export function imageType(bytes) {
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return ['image/jpeg', 'jpg'];
  if (Buffer.from(bytes.subarray(0, 8)).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return ['image/png', 'png'];
  if (Buffer.from(bytes.subarray(0,4)).toString() === 'RIFF' && Buffer.from(bytes.subarray(8,12)).toString() === 'WEBP') return ['image/webp', 'webp'];
  return null;
}

// Dependencies are injected so failure paths can be verified without remote writes.
export function createPhotoHandler({ authorize, findMeal, upload, save, remove }) {
  const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
  return async (req, context) => {
    let uploaded;
    try {
      const access = await authorize(req);
      if (access !== 200) return json({ error: access === 403 ? '无权修改这份记录' : '请先登录' }, access);
      const { id } = await context.params;
      if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) return json({ error: '餐记录 ID 无效' }, 400);
      if (!req.headers.get('content-type')?.startsWith('multipart/form-data')) return json({ error: '请使用 multipart/form-data' }, 415);
      if (Number(req.headers.get('content-length')) > MAX_PHOTO_BYTES + 65536) return json({ error: '图片不能超过 4 MB' }, 413);
      // Bound the body even when Content-Length is absent or false.
      const chunks = []; let size = 0;
      if (!req.body) return json({ error: '请选择图片' }, 400);
      const reader = req.body.getReader();
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        size += value.byteLength;
        if (size > MAX_PHOTO_BYTES + 65536) { await reader.cancel(); return json({ error: '图片不能超过 4 MB' }, 413); }
        chunks.push(Buffer.from(value));
      }
      let form;
      try { form = await new Response(Buffer.concat(chunks), { headers: { 'Content-Type': req.headers.get('content-type') } }).formData(); }
      catch { return json({ error: '上传表单无效' }, 400); }
      const role = form.get('role'), file = form.get('file');
      if (!['before', 'after'].includes(role)) return json({ error: 'role 必须为 before 或 after' }, 400);
      if (!(file instanceof File) || !file.size || form.getAll('file').length !== 1) return json({ error: '请选择一张图片' }, 400);
      if (file.size > MAX_PHOTO_BYTES) return json({ error: '图片不能超过 4 MB' }, 413);
      const bytes = Buffer.from(await file.arrayBuffer()), type = imageType(bytes);
      if (!type) return json({ error: '支持 JPG、PNG 和 WebP 图片' }, 415);
      const meal = await findMeal(id);
      if (!meal) return json({ error: '餐记录不存在' }, 404);
      const field = `photo_${role}_url`;
      uploaded = await upload(`meal-photos/${meal.record_date}/food-${id}-${role}`, bytes, type);
      // Compare only the selected slot: simultaneous before/after edits do not collide.
      const saved = await save(id, field, uploaded.url, meal[field]);
      if (!saved) { await remove(uploaded.url); uploaded = null; return json({ error: '图片已被修改，请刷新后重试' }, 409); }
      uploaded = null;
      return json(saved);
    } catch {
      if (uploaded) { try { await remove(uploaded.url); } catch { /* Leave recoverable orphan; keep original meal URL. */ } }
      return json({ error: '图片保存失败，请重试' }, 500);
    }
  };
}
