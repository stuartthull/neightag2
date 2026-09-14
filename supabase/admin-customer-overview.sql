-- Run this in the Supabase SQL editor, then set app_metadata.role = 'admin'
-- for the staff account in Authentication > Users.

drop function if exists public.get_admin_customer_overview();

create or replace function public.get_admin_customer_overview()
returns table (
    user_id uuid,
    user_email text,
    user_created_at timestamptz,
    horse_id bigint,
    horse_uuid uuid,
    horse_name text,
    subscription_status text,
    subscription_expires_at timestamptz,
    stripe_customer_id text
)
language sql
security definer
set search_path = public
as $$
    select
        users.id,
        users.email,
        users.created_at,
        horses.id,
        horses.horse_uuid,
        horses.horse_name,
        subscriptions.status,
        subscriptions.current_period_end,
        subscriptions.stripe_customer_id
    from auth.users as users
    left join public.equi_log_main as horses
        on horses.user_uuid = users.id
    left join public.equi_subscriptions as subscriptions
        on subscriptions.horse_uuid = horses.horse_uuid
    where (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    order by users.created_at desc, horses.created_at desc;
$$;

revoke all on function public.get_admin_customer_overview() from public;
grant execute on function public.get_admin_customer_overview() to authenticated;
