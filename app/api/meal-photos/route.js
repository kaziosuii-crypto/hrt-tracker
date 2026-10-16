import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  const bearer = req.headers.get("authorization") || "";
  if (!bearer.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = bearer.slice(7);
  const auth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const {
    data: { user },
    error,
  } = await auth.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedUser = process.env.DASHBOARD_ALLOWED_USER_ID;
  if (allowedUser && user.id !== allowedUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error: dbError } = await admin
    .schema("hrt")
    .from("food_logs")
    .select(
      "id,record_date,time_text,meal_type,food,photo_before_url,photo_after_url",
    )
    .order("record_date", { ascending: false })
    .order("id", { ascending: false })
    .limit(2000);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(
    (data || []).filter((row) => row.photo_before_url || row.photo_after_url),
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
