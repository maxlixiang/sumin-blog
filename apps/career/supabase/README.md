# Career OS Supabase setup

Phase 2 only needs one table and one manually provisioned email/password account.

1. Create a Supabase project.
2. Run `migrations/202609230001_create_daily_check_ins.sql` in the SQL editor or with the Supabase CLI.
3. Disable public sign-up in Supabase Auth.
4. Create the sole user manually in the Supabase dashboard.
5. Copy `.env.example` to `.env.local` and set the project URL, publishable key, and allowed email.
6. Never commit `.env.local` or real Career OS records.

The migration enables RLS, revokes anonymous access, and grants authenticated users access only to rows owned by `auth.uid()`.
