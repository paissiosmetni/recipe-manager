-- Profiles (extends Supabase Auth)
create table profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  is_public boolean default false,
  created_at timestamptz default now()
);

-- Recipes
create table recipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  cuisine text,
  prep_time integer, -- minutes
  cook_time integer, -- minutes
  servings integer,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  status text check (status in ('favorite', 'to_try', 'made_before')) default 'to_try',
  ingredients jsonb not null default '[]',
  instructions jsonb not null default '[]',
  image_url text,
  is_public boolean default false,
  ai_generated boolean default false,
  nutritional_info jsonb,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table recipes enable row level security;

-- Profiles policies
create policy "Public profiles viewable" on profiles for select using (is_public = true or id = auth.uid());
create policy "Users update own profile" on profiles for update using (id = auth.uid());
create policy "Users insert own profile" on profiles for insert with check (id = auth.uid());

-- Recipes policies
create policy "Users crud own recipes" on recipes for all using (user_id = auth.uid());
create policy "Public recipes viewable" on recipes for select using (is_public = true);

-- Chat Sessions
create table chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null default 'New Chat',
  messages jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table chat_sessions enable row level security;
create policy "Users crud own chats" on chat_sessions for all using (user_id = auth.uid());

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger recipes_updated_at before update on recipes
  for each row execute function update_updated_at();

create trigger chat_sessions_updated_at before update on chat_sessions
  for each row execute function update_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username, display_name)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name')
  on conflict (id) do update set
    display_name = excluded.display_name;
  return new;
exception
  when unique_violation then
    insert into profiles (id, username, display_name)
    values (new.id, new.raw_user_meta_data->>'username' || '_' || left(new.id::text, 4), new.raw_user_meta_data->>'full_name')
    on conflict (id) do update set
      display_name = excluded.display_name;
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Check username availability (bypasses RLS for unauthenticated signup)
create or replace function is_username_available(requested_username text)
returns boolean as $$
begin
  return not exists (select 1 from profiles where username = requested_username);
end;
$$ language plpgsql security definer;
