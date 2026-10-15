import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
const allowed=new Set(['measurement_timeline','weight_trend','breast_body_measurements','medication_history','lab_history','daily_overview','food_history'])
export async function GET(req){
 const view=new URL(req.url).searchParams.get('view'); if(!allowed.has(view))return NextResponse.json({error:'Invalid view'},{status:400})
 const bearer=req.headers.get('authorization')||''; if(!bearer.startsWith('Bearer '))return NextResponse.json({error:'Unauthorized'},{status:401})
 const token=bearer.slice(7)
 const auth=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data:{user},error}=await auth.auth.getUser(token); if(error||!user)return NextResponse.json({error:'Unauthorized'},{status:401})
 const allowedUser=process.env.DASHBOARD_ALLOWED_USER_ID; if(allowedUser&&user.id!==allowedUser)return NextResponse.json({error:'Forbidden'},{status:403})
 const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data,error:dbError}=await admin.schema('hrt').from('v_'+view).select('*').limit(10000)
 if(dbError)return NextResponse.json({error:dbError.message},{status:500})
 return NextResponse.json(data,{headers:{'Cache-Control':'private, no-store'}})
}
