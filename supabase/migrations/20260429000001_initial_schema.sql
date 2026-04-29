-- Enable UUID extension (gen_random_uuid is built-in to PostgreSQL 13+)
-- No extension needed for gen_random_uuid()

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  preferred_language text default 'en' check (preferred_language in ('en', 'zh', 'ja')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create dictionaries table
create table public.dictionaries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  word text not null,
  language text not null check (language in ('en', 'zh', 'ja')),
  definition_json jsonb not null,
  proficiency_level integer default 0 check (proficiency_level >= 0 and proficiency_level <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index dictionaries_user_id_idx on public.dictionaries(user_id);
create index dictionaries_language_idx on public.dictionaries(language);
create index dictionaries_created_at_idx on public.dictionaries(created_at desc);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.dictionaries enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Dictionaries policies
create policy "Users can view their own dictionaries"
  on public.dictionaries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own dictionaries"
  on public.dictionaries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own dictionaries"
  on public.dictionaries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own dictionaries"
  on public.dictionaries for delete
  using (auth.uid() = user_id);

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_dictionaries_updated_at
  before update on public.dictionaries
  for each row execute procedure public.handle_updated_at();
