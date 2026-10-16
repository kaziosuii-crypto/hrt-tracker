# HRT Dashboard

Private responsive Next.js dashboard backed by Supabase.

## Vercel environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (server only)
- `DASHBOARD_ALLOWED_USER_ID` (recommended after first login)

## Supabase Auth
Enable Google under Authentication → Providers. Add your production Vercel URL to Authentication → URL Configuration → Redirect URLs. The app returns to the same origin after Google OAuth.

## Data
The server endpoint only permits these private `hrt` views:
`v_measurement_timeline`, `v_weight_trend`, `v_breast_body_measurements`, `v_medication_history`, `v_lab_history`, `v_daily_overview`, `v_food_history`.

## UI / motion implementation

The commute transition uses original layered train-interior assets; wordmarks are frameless interactive navigation controls. See `docs/ART_DIRECTION.md`, `docs/ASSET_WORKFLOW.md` and `docs/VERIFICATION.md` for reference research, generation specifications, test evidence and current limitations. `DATA_CONTRACT.md` remains authoritative. No Supabase schema or production authentication bypass is introduced.
