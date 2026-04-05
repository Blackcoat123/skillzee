-- Skillzee final Supabase schema
-- Syncs with the current frontend routes and service-layer CRUD flows.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('learner', 'trainer', 'both');
  end if;

  if not exists (select 1 from pg_type where typname = 'delivery_mode') then
    create type delivery_mode as enum ('online', 'offline', 'both');
  end if;

  if not exists (select 1 from pg_type where typname = 'session_format') then
    create type session_format as enum ('google-meet', 'zoom', 'in-app', 'offline');
  end if;

  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type notification_type as enum ('booking', 'message', 'reminder', 'payment', 'review', 'system');
  end if;

  if not exists (select 1 from pg_type where typname = 'transaction_type') then
    create type transaction_type as enum ('earning', 'spending', 'refund', 'withdrawal', 'commission');
  end if;

  if not exists (select 1 from pg_type where typname = 'transaction_status') then
    create type transaction_status as enum ('pending', 'completed', 'failed');
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null,
  college text,
  phone_number text,
  profile_image text,
  bio text,
  interests text[] default '{}',
  role user_role not null default 'learner',
  points integer not null default 0,
  total_earnings double precision not null default 0,
  total_spent double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  criteria text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  created_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  category_id uuid references public.categories (id) on delete set null,
  tags text[] default '{}',
  price double precision not null check (price >= 0),
  duration integer not null check (duration > 0),
  delivery_mode delivery_mode not null,
  session_format session_format,
  location text,
  availability jsonb,
  rating double precision not null default 0 check (rating >= 0 and rating <= 5),
  total_reviews integer not null default 0,
  total_bookings integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills (id) on delete cascade,
  learner_id uuid not null references public.profiles (id) on delete cascade,
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  scheduled_date timestamptz not null,
  duration integer not null check (duration > 0),
  price double precision not null check (price >= 0),
  platform_commission double precision not null default 0 check (platform_commission >= 0),
  trainer_payout double precision not null default 0 check (trainer_payout >= 0),
  status booking_status not null default 'pending',
  learner_notes text,
  meeting_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_distinct_users check (learner_id <> trainer_id)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  learner_id uuid not null references public.profiles (id) on delete cascade,
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, skill_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint messages_distinct_users check (sender_id <> receiver_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type notification_type not null,
  title text not null,
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  available_balance double precision not null default 0 check (available_balance >= 0),
  pending_balance double precision not null default 0 check (pending_balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  booking_id uuid references public.bookings (id) on delete set null,
  type transaction_type not null,
  amount double precision not null check (amount >= 0),
  status transaction_status not null default 'completed',
  description text,
  created_at timestamptz not null default now()
);

create unique index if not exists uniq_transactions_user_booking_type
  on public.transactions (user_id, booking_id, type);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings (id) on delete cascade,
  learner_id uuid not null references public.profiles (id) on delete cascade,
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  skill_title text not null,
  issued_at timestamptz not null default now(),
  certificate_data jsonb default '{}'::jsonb
);

create table if not exists public.notification_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  subscription_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_role_points on public.profiles (role, points desc);
create index if not exists idx_skills_trainer on public.skills (trainer_id);
create index if not exists idx_skills_category on public.skills (category_id);
create index if not exists idx_skills_active on public.skills (is_active);
create index if not exists idx_skills_rating on public.skills (rating desc);
create index if not exists idx_skills_tags on public.skills using gin (tags);
create index if not exists idx_bookings_learner on public.bookings (learner_id);
create index if not exists idx_bookings_trainer on public.bookings (trainer_id);
create index if not exists idx_bookings_skill on public.bookings (skill_id);
create index if not exists idx_bookings_status_date on public.bookings (status, scheduled_date desc);
create index if not exists idx_reviews_skill on public.reviews (skill_id, created_at desc);
create index if not exists idx_messages_booking_created on public.messages (booking_id, created_at asc);
create index if not exists idx_messages_receiver_unread on public.messages (receiver_id, is_read);
create index if not exists idx_notifications_user_created on public.notifications (user_id, created_at desc);
create index if not exists idx_transactions_user_created on public.transactions (user_id, created_at desc);
create index if not exists idx_favorites_user on public.favorites (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_skills_updated_at on public.skills;
create trigger trg_skills_updated_at
before update on public.skills
for each row execute function public.set_updated_at();

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

drop trigger if exists trg_wallets_updated_at on public.wallets;
create trigger trg_wallets_updated_at
before update on public.wallets
for each row execute function public.set_updated_at();

drop trigger if exists trg_notification_subscriptions_updated_at on public.notification_subscriptions;
create trigger trg_notification_subscriptions_updated_at
before update on public.notification_subscriptions
for each row execute function public.set_updated_at();

create or replace function public.create_wallet_for_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.wallets (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_profiles_create_wallet on public.profiles;
create trigger trg_profiles_create_wallet
after insert on public.profiles
for each row execute function public.create_wallet_for_profile();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    college,
    phone_number,
    profile_image,
    bio,
    interests,
    role
  )
  values (
    new.id,
    coalesce(nullif(new.email, ''), concat('user-', new.id::text)),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(coalesce(new.email, concat('user-', new.id::text)), '@', 1)
    ),
    nullif(new.raw_user_meta_data ->> 'college', ''),
    nullif(new.raw_user_meta_data ->> 'phone_number', ''),
    nullif(coalesce(new.raw_user_meta_data ->> 'profile_image', new.raw_user_meta_data ->> 'avatar_url'), ''),
    nullif(new.raw_user_meta_data ->> 'bio', ''),
    case
      when jsonb_typeof(new.raw_user_meta_data -> 'interests') = 'array'
        then array(select jsonb_array_elements_text(new.raw_user_meta_data -> 'interests'))
      else '{}'::text[]
    end,
    case
      when new.raw_user_meta_data ->> 'role' in ('learner', 'trainer', 'both')
        then (new.raw_user_meta_data ->> 'role')::user_role
      else 'learner'::user_role
    end
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    college = excluded.college,
    phone_number = excluded.phone_number,
    profile_image = excluded.profile_image,
    bio = excluded.bio,
    interests = excluded.interests,
    role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

insert into public.profiles (
  id,
  email,
  full_name,
  college,
  phone_number,
  profile_image,
  bio,
  interests,
  role
)
select
  users.id,
  coalesce(nullif(users.email, ''), concat('user-', users.id::text)),
  coalesce(
    nullif(users.raw_user_meta_data ->> 'full_name', ''),
    split_part(coalesce(users.email, concat('user-', users.id::text)), '@', 1)
  ),
  nullif(users.raw_user_meta_data ->> 'college', ''),
  nullif(users.raw_user_meta_data ->> 'phone_number', ''),
  nullif(coalesce(users.raw_user_meta_data ->> 'profile_image', users.raw_user_meta_data ->> 'avatar_url'), ''),
  nullif(users.raw_user_meta_data ->> 'bio', ''),
  case
    when jsonb_typeof(users.raw_user_meta_data -> 'interests') = 'array'
      then array(select jsonb_array_elements_text(users.raw_user_meta_data -> 'interests'))
    else '{}'::text[]
  end,
  case
    when users.raw_user_meta_data ->> 'role' in ('learner', 'trainer', 'both')
      then (users.raw_user_meta_data ->> 'role')::user_role
    else 'learner'::user_role
  end
from auth.users as users
on conflict (id) do nothing;

create or replace function public.refresh_skill_rating(skill_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.skills
  set
    rating = coalesce(
      (
        select avg(reviews.rating)::double precision
        from public.reviews
        where reviews.skill_id = skill_uuid
      ),
      0
    ),
    total_reviews = (
      select count(*)
      from public.reviews
      where reviews.skill_id = skill_uuid
    )
  where id = skill_uuid;
end;
$$;

create or replace function public.refresh_skill_booking_count(skill_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.skills
  set total_bookings = (
    select count(*)
    from public.bookings
    where bookings.skill_id = skill_uuid
      and bookings.status <> 'cancelled'
  )
  where id = skill_uuid;
end;
$$;

create or replace function public.sync_user_financial_state(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_user_id is null then
    return;
  end if;

  insert into public.wallets (user_id)
  values (target_user_id)
  on conflict (user_id) do nothing;

  update public.profiles
  set
    total_earnings = coalesce(
      (
        select sum(amount)
        from public.transactions
        where user_id = target_user_id
          and type = 'earning'
          and status = 'completed'
      ),
      0
    ),
    total_spent = coalesce(
      (
        select sum(amount)
        from public.transactions
        where user_id = target_user_id
          and type = 'spending'
          and status = 'completed'
      ),
      0
    ),
    points =
      (
        select count(*)
        from public.bookings
        where learner_id = target_user_id
          and status = 'completed'
      ) * 10
      +
      (
        select count(*)
        from public.bookings
        where trainer_id = target_user_id
          and status = 'completed'
      ) * 20
      +
      (
        select count(*)
        from public.reviews
        where trainer_id = target_user_id
      ) * 5
      +
      (
        select count(*)
        from public.skills
        where trainer_id = target_user_id
          and is_active = true
      ) * 3
  where id = target_user_id;

  update public.wallets
  set
    available_balance = greatest(
      coalesce(
        (
          select sum(amount)
          from public.transactions
          where user_id = target_user_id
            and type = 'earning'
            and status = 'completed'
        ),
        0
      ) - coalesce(
        (
          select sum(amount)
          from public.transactions
          where user_id = target_user_id
            and type = 'withdrawal'
            and status = 'completed'
        ),
        0
      ),
      0
    ),
    pending_balance = greatest(
      coalesce(
        (
          select sum(amount)
          from public.transactions
          where user_id = target_user_id
            and type = 'earning'
            and status = 'pending'
        ),
        0
      ),
      0
    )
  where user_id = target_user_id;
end;
$$;

create or replace function public.sync_booking_transactions(target_booking public.bookings)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  skill_title text;
  learner_spending_status transaction_status;
  trainer_earning_status transaction_status;
begin
  select title into skill_title
  from public.skills
  where id = target_booking.skill_id;

  learner_spending_status :=
    case
      when target_booking.status = 'cancelled' then 'failed'::transaction_status
      else 'completed'::transaction_status
    end;

  trainer_earning_status :=
    case
      when target_booking.status = 'completed' then 'completed'::transaction_status
      when target_booking.status = 'cancelled' then 'failed'::transaction_status
      else 'pending'::transaction_status
    end;

  insert into public.transactions (
    user_id,
    booking_id,
    type,
    amount,
    status,
    description
  )
  values (
    target_booking.learner_id,
    target_booking.id,
    'spending',
    target_booking.price,
    learner_spending_status,
    concat('Payment for ', coalesce(skill_title, 'session'))
  )
  on conflict (user_id, booking_id, type) do update
  set
    amount = excluded.amount,
    status = excluded.status,
    description = excluded.description;

  insert into public.transactions (
    user_id,
    booking_id,
    type,
    amount,
    status,
    description
  )
  values (
    target_booking.trainer_id,
    target_booking.id,
    'earning',
    target_booking.trainer_payout,
    trainer_earning_status,
    concat('Earning from ', coalesce(skill_title, 'session'))
  )
  on conflict (user_id, booking_id, type) do update
  set
    amount = excluded.amount,
    status = excluded.status,
    description = excluded.description;
end;
$$;

create or replace function public.handle_review_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_skill_rating(old.skill_id);
    perform public.sync_user_financial_state(old.trainer_id);
    perform public.sync_user_financial_state(old.learner_id);
    return old;
  end if;

  perform public.refresh_skill_rating(new.skill_id);
  perform public.sync_user_financial_state(new.trainer_id);
  perform public.sync_user_financial_state(new.learner_id);

  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, type, title, message, link)
    values (
      new.trainer_id,
      'review',
      'New Review Received',
      'A learner left feedback on your session.',
      concat('/skills/', new.skill_id::text)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_reviews_sync on public.reviews;
create trigger trg_reviews_sync
after insert or update or delete on public.reviews
for each row execute function public.handle_review_changes();

create or replace function public.handle_booking_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  skill_title text;
begin
  if tg_op = 'DELETE' then
    delete from public.transactions
    where booking_id = old.id
      and type in ('earning', 'spending');

    delete from public.certificates
    where booking_id = old.id;

    perform public.refresh_skill_booking_count(old.skill_id);
    perform public.sync_user_financial_state(old.learner_id);
    perform public.sync_user_financial_state(old.trainer_id);
    return old;
  end if;

  select title into skill_title
  from public.skills
  where id = new.skill_id;

  perform public.sync_booking_transactions(new);
  perform public.refresh_skill_booking_count(new.skill_id);

  if tg_op = 'UPDATE' and old.skill_id is distinct from new.skill_id then
    perform public.refresh_skill_booking_count(old.skill_id);
  end if;

  if new.status = 'completed' then
    insert into public.certificates (
      booking_id,
      learner_id,
      trainer_id,
      skill_title,
      certificate_data
    )
    values (
      new.id,
      new.learner_id,
      new.trainer_id,
      coalesce(skill_title, 'Skillzee Session'),
      jsonb_build_object(
        'skill_title', coalesce(skill_title, 'Skillzee Session'),
        'issued_to', new.learner_id,
        'trainer_id', new.trainer_id,
        'booking_id', new.id,
        'issued_at', now()
      )
    )
    on conflict (booking_id) do update
    set
      skill_title = excluded.skill_title,
      certificate_data = excluded.certificate_data,
      issued_at = now();
  else
    delete from public.certificates
    where booking_id = new.id;
  end if;

  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, type, title, message, link)
    values
      (
        new.learner_id,
        'booking',
        'Booking Requested',
        concat('Your booking for ', coalesce(skill_title, 'a session'), ' has been created.'),
        '/dashboard'
      ),
      (
        new.trainer_id,
        'booking',
        'New Booking Request',
        concat('You have a new booking request for ', coalesce(skill_title, 'your session'), '.'),
        '/dashboard'
      );
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into public.notifications (user_id, type, title, message, link)
    values
      (
        new.learner_id,
        'booking',
        'Booking Status Updated',
        concat('Your booking is now ', new.status::text, '.'),
        '/dashboard'
      ),
      (
        new.trainer_id,
        'booking',
        'Booking Status Updated',
        concat('The booking for ', coalesce(skill_title, 'your session'), ' is now ', new.status::text, '.'),
        '/dashboard'
      );
  end if;

  perform public.sync_user_financial_state(new.learner_id);
  perform public.sync_user_financial_state(new.trainer_id);

  return new;
end;
$$;

drop trigger if exists trg_bookings_sync on public.bookings;
create trigger trg_bookings_sync
after insert or update or delete on public.bookings
for each row execute function public.handle_booking_changes();

create or replace function public.handle_message_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, message, link)
  values (
    new.receiver_id,
    'message',
    'New Message',
    'You received a new message about one of your sessions.',
    concat('/chat?booking=', new.booking_id::text)
  );

  return new;
end;
$$;

drop trigger if exists trg_messages_notify on public.messages;
create trigger trg_messages_notify
after insert on public.messages
for each row execute function public.handle_message_insert();

create or replace function public.get_admin_overview()
returns table (
  total_users bigint,
  total_bookings bigint,
  gross_revenue double precision,
  platform_revenue double precision
)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*) from public.profiles) as total_users,
    (select count(*) from public.bookings where status <> 'cancelled') as total_bookings,
    coalesce(
      (
        select sum(amount)
        from public.transactions
        where type = 'spending'
          and status = 'completed'
      ),
      0
    )::double precision as gross_revenue,
    coalesce(
      (
        select sum(platform_commission)
        from public.bookings
        where status <> 'cancelled'
      ),
      0
    )::double precision as platform_revenue;
$$;

create or replace function public.get_top_skills_admin(limit_count integer default 5)
returns table (
  title text,
  bookings bigint,
  revenue double precision
)
language sql
security definer
set search_path = public
as $$
  select
    skills.title,
    count(bookings.id) as bookings,
    coalesce(sum(bookings.price), 0)::double precision as revenue
  from public.skills
  left join public.bookings
    on bookings.skill_id = skills.id
   and bookings.status <> 'cancelled'
  group by skills.id, skills.title
  order by bookings desc, revenue desc, skills.title asc
  limit greatest(limit_count, 1);
$$;

grant execute on function public.get_admin_overview() to anon, authenticated;
grant execute on function public.get_top_skills_admin(integer) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.categories enable row level security;
alter table public.skills enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.certificates enable row level security;
alter table public.notification_subscriptions enable row level security;

drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone"
on public.profiles
for select
using (true);

drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Public badges are viewable by everyone" on public.badges;
create policy "Public badges are viewable by everyone"
on public.badges
for select
using (true);

drop policy if exists "Users can view badge assignments" on public.user_badges;
create policy "Users can view badge assignments"
on public.user_badges
for select
using (auth.uid() = user_id);

drop policy if exists "Categories are viewable by everyone" on public.categories;
create policy "Categories are viewable by everyone"
on public.categories
for select
using (true);

drop policy if exists "Skills are viewable by everyone" on public.skills;
create policy "Skills are viewable by everyone"
on public.skills
for select
using (true);

drop policy if exists "Trainers can create skills" on public.skills;
create policy "Trainers can create skills"
on public.skills
for insert
with check (
  auth.uid() = trainer_id
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('trainer', 'both')
  )
);

drop policy if exists "Trainers can update own skills" on public.skills;
create policy "Trainers can update own skills"
on public.skills
for update
using (auth.uid() = trainer_id)
with check (
  auth.uid() = trainer_id
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('trainer', 'both')
  )
);

drop policy if exists "Trainers can delete own skills" on public.skills;
create policy "Trainers can delete own skills"
on public.skills
for delete
using (auth.uid() = trainer_id);

drop policy if exists "Users can view own bookings" on public.bookings;
create policy "Users can view own bookings"
on public.bookings
for select
using (auth.uid() = learner_id or auth.uid() = trainer_id);

drop policy if exists "Learners can create bookings" on public.bookings;
create policy "Learners can create bookings"
on public.bookings
for insert
with check (
  auth.uid() = learner_id
  and exists (
    select 1
    from public.skills
    where skills.id = skill_id
      and skills.trainer_id = trainer_id
      and skills.is_active = true
  )
);

drop policy if exists "Participants can update bookings" on public.bookings;
create policy "Participants can update bookings"
on public.bookings
for update
using (auth.uid() = learner_id or auth.uid() = trainer_id)
with check (auth.uid() = learner_id or auth.uid() = trainer_id);

drop policy if exists "Reviews are viewable by everyone" on public.reviews;
create policy "Reviews are viewable by everyone"
on public.reviews
for select
using (true);

drop policy if exists "Learners can add reviews for completed bookings" on public.reviews;
create policy "Learners can add reviews for completed bookings"
on public.reviews
for insert
with check (
  auth.uid() = learner_id
  and exists (
    select 1
    from public.bookings
    where bookings.id = booking_id
      and bookings.learner_id = learner_id
      and bookings.trainer_id = trainer_id
      and bookings.skill_id = skill_id
      and bookings.status = 'completed'
  )
);

drop policy if exists "Users can view own favorites" on public.favorites;
create policy "Users can view own favorites"
on public.favorites
for select
using (auth.uid() = user_id);

drop policy if exists "Users can add favorites" on public.favorites;
create policy "Users can add favorites"
on public.favorites
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can remove favorites" on public.favorites;
create policy "Users can remove favorites"
on public.favorites
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view own conversation messages" on public.messages;
create policy "Users can view own conversation messages"
on public.messages
for select
using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Participants can send booking messages" on public.messages;
create policy "Participants can send booking messages"
on public.messages
for insert
with check (
  auth.uid() = sender_id
  and exists (
    select 1
    from public.bookings
    where bookings.id = booking_id
      and (
        (bookings.learner_id = sender_id and bookings.trainer_id = receiver_id)
        or
        (bookings.trainer_id = sender_id and bookings.learner_id = receiver_id)
      )
  )
);

drop policy if exists "Receivers can mark messages as read" on public.messages;
create policy "Receivers can mark messages as read"
on public.messages
for update
using (auth.uid() = receiver_id)
with check (auth.uid() = receiver_id);

drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
on public.notifications
for select
using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
on public.notifications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own notifications" on public.notifications;
create policy "Users can delete own notifications"
on public.notifications
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view own wallet" on public.wallets;
create policy "Users can view own wallet"
on public.wallets
for select
using (auth.uid() = user_id);

drop policy if exists "Users can view own transactions" on public.transactions;
create policy "Users can view own transactions"
on public.transactions
for select
using (auth.uid() = user_id);

drop policy if exists "Users can view their certificates" on public.certificates;
create policy "Users can view their certificates"
on public.certificates
for select
using (auth.uid() = learner_id or auth.uid() = trainer_id);

drop policy if exists "Users can view own notification subscriptions" on public.notification_subscriptions;
create policy "Users can view own notification subscriptions"
on public.notification_subscriptions
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own notification subscriptions" on public.notification_subscriptions;
create policy "Users can insert own notification subscriptions"
on public.notification_subscriptions
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own notification subscriptions" on public.notification_subscriptions;
create policy "Users can update own notification subscriptions"
on public.notification_subscriptions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own notification subscriptions" on public.notification_subscriptions;
create policy "Users can delete own notification subscriptions"
on public.notification_subscriptions
for delete
using (auth.uid() = user_id);

insert into public.categories (name, description, icon)
values
  ('Programming', 'Coding, software development, and technical skills', 'Code'),
  ('Design', 'UI/UX, graphic design, and creative skills', 'Palette'),
  ('Data Analytics', 'Data analysis, visualization, and statistics', 'BarChart'),
  ('Communication', 'Public speaking, presentation, and writing skills', 'MessageSquare'),
  ('Interview Prep', 'Career guidance and interview preparation', 'Briefcase'),
  ('Portfolio Building', 'Building professional portfolios and projects', 'FolderOpen'),
  ('Marketing', 'Digital marketing, SEO, and social media', 'TrendingUp'),
  ('Languages', 'Foreign language learning and practice', 'Globe'),
  ('Finance', 'Financial literacy and investment basics', 'DollarSign'),
  ('Photography', 'Photography techniques and editing', 'Camera')
on conflict (name) do update
set
  description = excluded.description,
  icon = excluded.icon;

insert into public.badges (name, description, icon, criteria)
values
  ('Rising Star', 'Earned first 5-star review', 'Star', 'Receive your first 5-star review'),
  ('Session Master', 'Completed 10 sessions', 'Award', 'Complete 10 training sessions'),
  ('Top Rated', 'Maintained 4.8+ rating with 20+ reviews', 'Medal', 'Achieve 4.8+ average rating with at least 20 reviews'),
  ('Early Adopter', 'One of the first 100 users', 'Zap', 'Be among the first 100 users on the platform'),
  ('Knowledge Sharer', 'Created 5 different skill listings', 'BookOpen', 'Create and publish 5 different skills'),
  ('Dedicated Learner', 'Completed 15 learning sessions', 'GraduationCap', 'Complete 15 learning sessions'),
  ('Quick Responder', 'Average response time under 2 hours', 'Clock', 'Maintain fast response time'),
  ('Revenue Champion', 'Earned more than 10,000', 'Trophy', 'Earn at least 10,000 on Skillzee')
on conflict (name) do update
set
  description = excluded.description,
  icon = excluded.icon,
  criteria = excluded.criteria;
