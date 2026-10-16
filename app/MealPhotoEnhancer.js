"use client";
import {useEffect} from "react";
import {supabase} from "../lib/supabase";

const dateKey=(s)=>{const m=String(s||"").match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);return m?`${m[1]}-${m[2].padStart(2,"0")}-${m[3].padStart(2,"0")}`:null};

export default function MealPhotoEnhancer(){
 useEffect(()=>{
  let stopped=false, observer;
  const run=async()=>{
   const {data:{session}}=await supabase.auth.getSession();
   if(!session||stopped)return;
   const res=await fetch('/api/data?view=food_history',{headers:{Authorization:`Bearer ${session.access_token}`},cache:'no-store'});
   if(!res.ok||stopped)return;
   const rows=await res.json();
   const attach=()=>{
    document.querySelectorAll('.foodDay').forEach(dayEl=>{
     const d=dateKey(dayEl.querySelector(':scope > button b')?.textContent);
     dayEl.querySelectorAll('article.intake').forEach(card=>{
      if(card.querySelector('.mealPhotos'))return;
      const time=card.querySelector('time')?.textContent?.trim()||'';
      const title=card.querySelector(':scope > b')?.textContent||'';
      const r=rows.find(x=>x.record_date===d && title.includes(x.food||'') && (!x.time_text || time===x.time_text));
      if(!r)return;
      const pics=[['餐前',r.photo_before_url],['餐后',r.photo_after_url]].filter(x=>x[1]);
      if(!pics.length)return;
      const wrap=document.createElement('div');wrap.className='mealPhotos';
      for(const [label,url] of pics){const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noreferrer';a.className='mealPhoto';const img=document.createElement('img');img.src=url;img.alt=`${label}照片`;img.loading='lazy';const span=document.createElement('span');span.textContent=label;a.append(img,span);wrap.append(a)}
      const details=card.querySelector('.details');card.insertBefore(wrap,details||null);
     })
    })
   };
   attach();observer=new MutationObserver(attach);observer.observe(document.body,{subtree:true,childList:true});
  };run();return()=>{stopped=true;observer?.disconnect()};
 },[]);return null;
}
