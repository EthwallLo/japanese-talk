create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their profile" on public.profiles;
create policy "Users can read their profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  level text not null,
  duration_minutes integer not null,
  description text not null,
  accent text not null default 'sakura',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug)
);

create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  level text not null,
  description text not null,
  accent text not null default 'indigo',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_path_courses (
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  position integer not null,
  created_at timestamptz not null default now(),
  primary key (learning_path_id, course_id),
  unique (learning_path_id, position)
);

alter table public.courses enable row level security;
alter table public.course_lessons enable row level security;
alter table public.learning_paths enable row level security;
alter table public.learning_path_courses enable row level security;

drop policy if exists "Authenticated users can read courses" on public.courses;
create policy "Authenticated users can read courses"
on public.courses
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read course lessons" on public.course_lessons;
create policy "Authenticated users can read course lessons"
on public.course_lessons
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read learning paths" on public.learning_paths;
create policy "Authenticated users can read learning paths"
on public.learning_paths
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read learning path courses" on public.learning_path_courses;
create policy "Authenticated users can read learning path courses"
on public.learning_path_courses
for select
to authenticated
using (true);

insert into public.courses (slug, title, level, duration_minutes, description, accent, sort_order)
values
  ('hiragana', 'Hiragana', 'Grand débutant', 45, 'Apprendre les hiragana, leur prononciation et les premières lectures simples.', 'sakura', 10),
  ('katakana', 'Katakana', 'Grand débutant', 45, 'Reconnaître les katakana et lire les mots étrangers courants en japonais.', 'mint', 20),
  ('salutations', 'Salutations', 'Grand débutant', 30, 'Dire bonjour, se présenter et répondre avec des phrases naturelles.', 'amber', 30)
on conflict (slug) do update
set
  title = excluded.title,
  level = excluded.level,
  duration_minutes = excluded.duration_minutes,
  description = excluded.description,
  accent = excluded.accent,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.course_lessons (course_id, slug, title, description, sort_order)
select courses.id, lessons.slug, lessons.title, lessons.description, lessons.sort_order
from public.courses
join (
  values
    ('hiragana', 'voyelles', 'Les voyelles', 'Lire et prononcer あ, い, う, え, お.', 10),
    ('hiragana', 'lignes-k-s-t', 'Les lignes K, S et T', 'Construire les premières syllabes et les lire en rythme.', 20),
    ('hiragana', 'premiers-mots', 'Premiers mots en hiragana', 'Lire des mots courts et installer les bons réflexes.', 30),
    ('katakana', 'voyelles', 'Les voyelles', 'Lire et prononcer ア, イ, ウ, エ, オ.', 10),
    ('katakana', 'mots-etrangers', 'Mots étrangers', 'Repérer les sons utilisés dans les emprunts courants.', 20),
    ('katakana', 'lecture-simple', 'Lecture simple', 'Lire des mots courts en katakana sans hésiter.', 30),
    ('salutations', 'bonjour-au-revoir', 'Bonjour et au revoir', 'Choisir la bonne formule selon le moment et le contexte.', 10),
    ('salutations', 'se-presenter', 'Se présenter', 'Dire son nom et accueillir une réponse simple.', 20),
    ('salutations', 'phrases-polies', 'Phrases polies', 'Utiliser merci, excuse-moi et enchanté naturellement.', 30)
) as lessons(course_slug, slug, title, description, sort_order)
on lessons.course_slug = courses.slug
on conflict (course_id, slug) do update
set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.learning_paths (slug, title, level, description, accent, sort_order)
values (
  'grand-debutant',
  'Grand débutant',
  'Niveau zéro',
  'Un premier parcours pour apprendre les kana et commencer à saluer en japonais.',
  'indigo',
  10
)
on conflict (slug) do update
set
  title = excluded.title,
  level = excluded.level,
  description = excluded.description,
  accent = excluded.accent,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.learning_path_courses (learning_path_id, course_id, position)
select learning_paths.id, courses.id, path_courses.position
from public.learning_paths
join (
  values
    ('hiragana', 10),
    ('katakana', 20),
    ('salutations', 30)
) as path_courses(course_slug, position)
on true
join public.courses on courses.slug = path_courses.course_slug
where learning_paths.slug = 'grand-debutant'
on conflict (learning_path_id, course_id) do update
set position = excluded.position;
