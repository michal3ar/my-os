-- MyOS Database Schema — Phase 1
-- הרץ/י בסדר הזה ב-Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- daily_checkins
-- =====================
create table if not exists public.daily_checkins (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  date            date not null,
  schedule_notes  text,
  free_hours      numeric(3,1) not null default 4,
  energy          text not null check (energy in ('high','medium','low')),
  mood            text not null check (mood in ('happy','neutral','sad','frustrated')),
  has_urgent      boolean not null default false,
  urgent_details  text,
  ai_plan         jsonb,
  created_at      timestamptz default now() not null,
  unique (user_id, date)
);

-- RLS
alter table public.daily_checkins enable row level security;

create policy "Users can manage their own checkins"
  on public.daily_checkins
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================
-- tasks
-- =====================
create table if not exists public.tasks (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references auth.users(id) on delete cascade not null,
  title               text not null,
  description         text,
  hats                text[] not null default '{}',
  urgency             smallint not null default 3 check (urgency between 1 and 5),
  importance          smallint not null default 3 check (importance between 1 and 5),
  deadline            date,
  estimated_minutes   integer,
  energy_type         text not null default 'thinking'
                        check (energy_type in ('filming','writing','editing','thinking','calls','bureaucracy','home','creative','technical')),
  status              text not null default 'todo'
                        check (status in ('new','todo','in_progress','stuck','done')),
  is_recurring        boolean not null default false,
  recurrence_pattern  text,
  is_strategic        boolean not null default false,
  stuck_reason        text,
  stuck_since         timestamptz,
  created_at          timestamptz default now() not null,
  completed_at        timestamptz
);

-- RLS
alter table public.tasks enable row level security;

create policy "Users can manage their own tasks"
  on public.tasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for common queries
create index if not exists tasks_user_status_idx on public.tasks (user_id, status);
create index if not exists tasks_user_urgency_idx on public.tasks (user_id, urgency desc);

-- =====================
-- inspirations
-- =====================
create table if not exists public.inspirations (
  id               uuid default uuid_generate_v4() primary key,
  user_id          uuid references auth.users(id) on delete cascade not null,
  url              text,
  platform         text not null default 'other' check (platform in ('tiktok','instagram','other')),
  title            text,
  why_saved        text not null,
  categories       text[] not null default '{}',
  relevant_hats    text[] not null default '{}',
  relevant_products text[] not null default '{}',
  status           text not null default 'saved' check (status in ('saved','analyzed','ready_to_use','used')),
  notes            text,
  saved_at         timestamptz default now() not null
);

alter table public.inspirations enable row level security;

create policy "Users can manage their own inspirations"
  on public.inspirations
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists inspirations_user_idx on public.inspirations (user_id, saved_at desc);

-- =====================
-- filmed_content
-- =====================
create table if not exists public.filmed_content (
  id                   uuid default uuid_generate_v4() primary key,
  user_id              uuid references auth.users(id) on delete cascade not null,
  description          text not null,
  hats                 text[] not null default '{}',
  location             text not null default 'gallery' check (location in ('gallery','folder','cloud','link')),
  location_detail      text,
  missing_for_publish  text[] not null default '{}',
  urgency              smallint not null default 3 check (urgency between 1 and 5),
  potential            text not null default 'medium' check (potential in ('high','medium','low')),
  status               text not null default 'filmed' check (status in ('filmed','needs_edit','in_edit','ready','published')),
  filmed_at            timestamptz default now() not null,
  published_at         timestamptz,
  created_at           timestamptz default now() not null
);

alter table public.filmed_content enable row level security;
create policy "Users can manage their filmed content"
  on public.filmed_content for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists filmed_content_user_idx on public.filmed_content (user_id, created_at desc);

-- =====================
-- content_items
-- =====================
create table if not exists public.content_items (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  type         text not null check (type in ('hook','cta','script','reel_idea','story_idea','published','pending')),
  title        text not null,
  body         text,
  hats         text[] not null default '{}',
  platform     text,
  status       text not null default 'draft' check (status in ('draft','ready','published','archived')),
  performance  text check (performance in ('high','medium','low')),
  notes        text,
  created_at   timestamptz default now() not null,
  published_at timestamptz
);

alter table public.content_items enable row level security;
create policy "Users can manage their content items"
  on public.content_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists content_items_user_idx on public.content_items (user_id, created_at desc);
