create extension if not exists "pgcrypto";

create table if not exists public.demos (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text default '' not null,
  share_token text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.demo_images (
  id text primary key,
  demo_id uuid not null references public.demos(id) on delete cascade,
  image_url text not null,
  image_path text,
  sort_order integer not null default 0,
  file_name text not null
);

create table if not exists public.feedback (
  id text primary key,
  demo_id uuid not null references public.demos(id) on delete cascade,
  nickname text,
  content text not null,
  device_type text not null default 'unknown',
  created_at timestamptz not null default now()
);

create index if not exists demos_creator_id_idx on public.demos (creator_id);
create index if not exists demos_share_token_idx on public.demos (share_token);
create index if not exists demo_images_demo_id_idx on public.demo_images (demo_id);
create index if not exists feedback_demo_id_idx on public.feedback (demo_id);

alter table public.demos enable row level security;
alter table public.demo_images enable row level security;
alter table public.feedback enable row level security;

create policy "Owners can view demos"
on public.demos
for select
to authenticated
using (auth.uid() = creator_id);

create policy "Owners can insert demos"
on public.demos
for insert
to authenticated
with check (auth.uid() = creator_id);

create policy "Owners can update demos"
on public.demos
for update
to authenticated
using (auth.uid() = creator_id)
with check (auth.uid() = creator_id);

create policy "Owners can delete demos"
on public.demos
for delete
to authenticated
using (auth.uid() = creator_id);

create policy "Owners can view demo images"
on public.demo_images
for select
to authenticated
using (
  exists (
    select 1 from public.demos
    where public.demos.id = public.demo_images.demo_id
      and public.demos.creator_id = auth.uid()
  )
);

create policy "Owners can manage demo images"
on public.demo_images
for all
to authenticated
using (
  exists (
    select 1 from public.demos
    where public.demos.id = public.demo_images.demo_id
      and public.demos.creator_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.demos
    where public.demos.id = public.demo_images.demo_id
      and public.demos.creator_id = auth.uid()
  )
);

create policy "Owners can view feedback"
on public.feedback
for select
to authenticated
using (
  exists (
    select 1 from public.demos
    where public.demos.id = public.feedback.demo_id
      and public.demos.creator_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('demo-images', 'demo-images', true)
on conflict (id) do nothing;
