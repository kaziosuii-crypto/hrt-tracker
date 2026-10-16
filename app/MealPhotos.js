"use client";
import { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import './MealPhotoEnhancer.css';

export default function MealPhotos({ meal }) {
  const [photos, setPhotos] = useState({ before: meal.photo_before_url, after: meal.photo_after_url });
  const [busy, setBusy] = useState(null), [message, setMessage] = useState('');
  const [broken, setBroken] = useState({});
  const pending = useRef(false);
  async function change(role, event) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || pending.current) return;
    if (file.size > 4_000_000) { setMessage('图片不能超过 4 MB'); return; }
    pending.current = true; setBusy(role); setMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw Error('请先登录');
      const form = new FormData(); form.set('role', role); form.set('file', file);
      const response = await fetch(`/api/food-logs/${meal.id}/photos`, { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` }, body: form });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || '上传失败');
      setPhotos({ before: result.photo_before_url, after: result.photo_after_url });
      setBroken((old) => ({ ...old, [role]: false }));
      setMessage('图片已保存');
    } catch (error) { setMessage(error.message || '上传失败，请重试'); }
    finally { pending.current = false; setBusy(null); }
  }
  return <div className="mealPhotoEditor">
    <div className="mealPhotos">{[['before', '餐前'], ['after', '餐后']].map(([role, label]) => {
      const url = photos[role];
      return <div className="mealPhotoSlot" key={role}>
        <a className="mealPhoto" href={url && !broken[role] ? url : undefined} target="_blank" rel="noreferrer" aria-label={`${label}照片`}>
          <img src={url && !broken[role] ? url : '/meal-photo-placeholder.svg'} alt={url && !broken[role] ? `${label}照片` : `${label}暂无照片`} loading="lazy" onError={() => { if (url && !broken[role]) setBroken((old) => ({ ...old, [role]: true })); }} />
          <span>{label}{(!url || broken[role]) && ' · 暂无照片'}</span>
        </a>
        <label className="mealPhotoUpload">{busy === role ? '上传中…' : url ? `替换${label}图片` : `上传${label}图片`}
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy !== null} aria-label={`${meal.meal_type || '本餐'}${label}图片`} onChange={(event) => change(role, event)} />
        </label>
      </div>;
    })}</div>
    <small>JPG / PNG / WebP，最大 4 MB</small>
    <p role="status" aria-live="polite">{message}</p>
  </div>;
}
