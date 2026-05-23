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
