-- Apply this only after final.sql.
-- This removes most database-side protections for fast local/dev use.
-- It is intentionally unsafe for production.

begin;

grant usage, create on schema public to anon, authenticated, service_role;
grant all privileges on all tables in schema public to anon, authenticated, service_role;
grant all privileges on all sequences in schema public to anon, authenticated, service_role;
grant all privileges on all routines in schema public to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on routines to anon, authenticated, service_role;

alter table public.profiles disable row level security;
alter table public.badges disable row level security;
alter table public.user_badges disable row level security;
alter table public.categories disable row level security;
alter table public.skills disable row level security;
alter table public.bookings disable row level security;
alter table public.reviews disable row level security;
alter table public.favorites disable row level security;
alter table public.messages disable row level security;
alter table public.notifications disable row level security;
alter table public.wallets disable row level security;
alter table public.transactions disable row level security;
alter table public.certificates disable row level security;
alter table public.notification_subscriptions disable row level security;

-- Keep profile creation working even when app-side insert happens before triggers catch up.
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

comment on schema public is 'Permissive dev schema configuration applied by update.sql';

commit;
