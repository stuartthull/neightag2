create table public.equi_subscriptions (
  id bigserial not null,
  user_uuid uuid null,
  horse_uuid uuid null,
  stripe_customer_id text null,
  stripe_subscription_id text null,
  stripe_price_id text null,
  status text null default 'inactive'::text,
  current_period_end timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint equi_subscriptions_pkey primary key (id),
  constraint equi_subscriptions_horse_uuid_key unique (horse_uuid),
  constraint equi_subscriptions_stripe_subscription_id_key unique (stripe_subscription_id),
  constraint equi_subscriptions_horse_uuid_fkey foreign KEY (horse_uuid) references equi_log_main (horse_uuid) on delete CASCADE,
  constraint equi_subscriptions_user_uuid_fkey foreign KEY (user_uuid) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_equi_subscriptions_status on public.equi_subscriptions using btree (horse_uuid, status) TABLESPACE pg_default;