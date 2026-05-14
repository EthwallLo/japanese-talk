create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
add column if not exists is_admin boolean not null default false;

alter table public.profiles enable row level security;

drop policy if exists "Users can read their profile" on public.profiles;
create policy "Users can read their profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

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

insert into public.profiles (id, email)
select users.id, users.email
from auth.users as users
on conflict (id) do update
set
  email = excluded.email,
  updated_at = now();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select profiles.is_admin
      from public.profiles
      where profiles.id = auth.uid()
    ),
    false
  );
$$;

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id and is_admin = public.is_admin());

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  format text not null default 'lesson_course',
  level text not null,
  duration_minutes integer not null,
  description text not null,
  objective text not null default '',
  accent text not null default 'sakura',
  status text not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses
add column if not exists format text not null default 'lesson_course';

alter table public.courses
add column if not exists objective text not null default '';

alter table public.courses
add column if not exists status text not null default 'draft';

create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  slug text not null,
  title text not null,
  content_type text not null default 'lesson',
  description text not null,
  objective text not null default '',
  dialogue text not null default '',
  body text not null default '',
  transcript text not null default '',
  translation text not null default '',
  vocabulary_notes text not null default '',
  grammar_notes text not null default '',
  culture_notes text not null default '',
  examples text not null default '',
  exercises text not null default '',
  comprehension_questions text not null default '',
  audio_url text not null default '',
  slow_audio_url text not null default '',
  natural_audio_url text not null default '',
  status text not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug)
);

alter table public.course_lessons
add column if not exists content_type text not null default 'lesson';

alter table public.course_lessons
add column if not exists objective text not null default '';

alter table public.course_lessons
add column if not exists dialogue text not null default '';

alter table public.course_lessons
add column if not exists body text not null default '';

alter table public.course_lessons
add column if not exists transcript text not null default '';

alter table public.course_lessons
add column if not exists translation text not null default '';

alter table public.course_lessons
add column if not exists vocabulary_notes text not null default '';

alter table public.course_lessons
add column if not exists grammar_notes text not null default '';

alter table public.course_lessons
add column if not exists culture_notes text not null default '';

alter table public.course_lessons
add column if not exists examples text not null default '';

alter table public.course_lessons
add column if not exists exercises text not null default '';

alter table public.course_lessons
add column if not exists comprehension_questions text not null default '';

alter table public.course_lessons
add column if not exists audio_url text not null default '';

alter table public.course_lessons
add column if not exists slow_audio_url text not null default '';

alter table public.course_lessons
add column if not exists natural_audio_url text not null default '';

alter table public.course_lessons
add column if not exists status text not null default 'draft';

create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  level text not null,
  description text not null,
  goal text not null default '',
  accent text not null default 'indigo',
  status text not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.learning_paths
add column if not exists goal text not null default '';

alter table public.learning_paths
add column if not exists status text not null default 'draft';

create table if not exists public.learning_path_courses (
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  position integer not null,
  created_at timestamptz not null default now(),
  primary key (learning_path_id, course_id),
  unique (learning_path_id, position)
);

create table if not exists public.vocabulary_items (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  reading text not null default '',
  meaning_fr text not null,
  part_of_speech text not null default '',
  level text not null default '',
  notes text not null default '',
  example_japanese text not null default '',
  example_french text not null default '',
  status text not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (term, reading)
);

alter table public.vocabulary_items
add column if not exists status text not null default 'draft';

create table if not exists public.kanji_items (
  id uuid primary key default gen_random_uuid(),
  character text not null unique,
  meaning_fr text not null,
  onyomi text not null default '',
  kunyomi text not null default '',
  level text not null default '',
  stroke_count integer not null default 0,
  notes text not null default '',
  examples text not null default '',
  status text not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.kanji_items
add column if not exists status text not null default 'draft';

create table if not exists public.lesson_vocabulary_items (
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  vocabulary_item_id uuid not null references public.vocabulary_items(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (lesson_id, vocabulary_item_id),
  unique (lesson_id, position)
);

create table if not exists public.lesson_kanji_items (
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  kanji_item_id uuid not null references public.kanji_items(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (lesson_id, kanji_item_id),
  unique (lesson_id, position)
);

alter table public.courses enable row level security;
alter table public.course_lessons enable row level security;
alter table public.learning_paths enable row level security;
alter table public.learning_path_courses enable row level security;
alter table public.vocabulary_items enable row level security;
alter table public.kanji_items enable row level security;
alter table public.lesson_vocabulary_items enable row level security;
alter table public.lesson_kanji_items enable row level security;

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

drop policy if exists "Authenticated users can read vocabulary items" on public.vocabulary_items;
create policy "Authenticated users can read vocabulary items"
on public.vocabulary_items
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read kanji items" on public.kanji_items;
create policy "Authenticated users can read kanji items"
on public.kanji_items
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read lesson vocabulary items" on public.lesson_vocabulary_items;
create policy "Authenticated users can read lesson vocabulary items"
on public.lesson_vocabulary_items
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read lesson kanji items" on public.lesson_kanji_items;
create policy "Authenticated users can read lesson kanji items"
on public.lesson_kanji_items
for select
to authenticated
using (true);

drop policy if exists "Admins can manage courses" on public.courses;
create policy "Admins can manage courses"
on public.courses
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage course lessons" on public.course_lessons;
create policy "Admins can manage course lessons"
on public.course_lessons
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage learning paths" on public.learning_paths;
create policy "Admins can manage learning paths"
on public.learning_paths
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage learning path courses" on public.learning_path_courses;
create policy "Admins can manage learning path courses"
on public.learning_path_courses
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage vocabulary items" on public.vocabulary_items;
create policy "Admins can manage vocabulary items"
on public.vocabulary_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage kanji items" on public.kanji_items;
create policy "Admins can manage kanji items"
on public.kanji_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage lesson vocabulary items" on public.lesson_vocabulary_items;
create policy "Admins can manage lesson vocabulary items"
on public.lesson_vocabulary_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage lesson kanji items" on public.lesson_kanji_items;
create policy "Admins can manage lesson kanji items"
on public.lesson_kanji_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

update public.courses
set status = 'online'
where status = 'published';

update public.course_lessons
set status = 'online'
where status = 'published';

update public.learning_paths
set status = 'online'
where status = 'published';

update public.vocabulary_items
set status = 'online'
where status = 'published';

update public.kanji_items
set status = 'online'
where status = 'published';

update public.learning_paths
set
  slug = 'debuter-en-japonais',
  updated_at = now()
where slug = 'grand-debutant'
  and not exists (
    select 1
    from public.learning_paths
    where slug = 'debuter-en-japonais'
  );

update public.courses
set
  slug = 'presentations',
  updated_at = now()
where slug = 'salutations'
  and not exists (
    select 1
    from public.courses
    where slug = 'presentations'
  );

insert into public.courses (slug, title, format, level, duration_minutes, description, objective, accent, status, sort_order)
values
  ('hiragana', 'Hiragana', 'lesson_course', 'Grand débutant', 45, 'Apprendre les hiragana, leur prononciation et les premières lectures simples.', 'Lire les premiers mots en hiragana sans romaji.', 'sakura', 'online', 10),
  ('katakana', 'Katakana', 'lesson_course', 'Grand débutant', 45, 'Reconnaître les katakana et lire les mots étrangers courants en japonais.', 'Lire les emprunts courants en katakana.', 'mint', 'online', 20),
  ('prononciation', 'Prononciation', 'lesson_course', 'Grand débutant', 35, 'Installer les sons japonais, le rythme, les voyelles longues et les consonnes doubles.', 'Prendre de bons réflexes de prononciation dès le départ.', 'amber', 'online', 30),
  ('ordre-des-mots', 'Ordre des mots', 'lesson_course', 'Grand débutant', 30, 'Comprendre la structure de base des phrases japonaises et la place du verbe.', 'Former des phrases simples dans un ordre naturel.', 'indigo', 'online', 40),
  ('particules-de-base', 'Particules は, が, を, に, で, と', 'lesson_course', 'Grand débutant', 60, 'Repérer le rôle des principales particules dans des phrases simples.', 'Identifier les fonctions essentielles des particules de base.', 'sakura', 'online', 50),
  ('premieres-phrases', 'Premières phrases', 'lesson_course', 'Grand débutant', 35, 'Construire des phrases courtes pour parler de soi, poser une question et répondre.', 'Produire ses premières phrases complètes.', 'mint', 'online', 60),
  ('presentations', 'Présentations', 'lesson_course', 'Grand débutant', 30, 'Se présenter, demander le nom de quelqu’un et répondre naturellement.', 'Se présenter dans un échange simple et poli.', 'amber', 'online', 70),
  ('nombres', 'Nombres', 'lesson_course', 'Grand débutant', 30, 'Compter, reconnaître les nombres courants et les utiliser dans des phrases simples.', 'Utiliser les nombres dans les situations du quotidien.', 'indigo', 'online', 80),
  ('dates', 'Dates', 'lesson_course', 'Grand débutant', 30, 'Dire les jours, les mois et les dates utiles dans une conversation simple.', 'Comprendre et donner une date simple.', 'sakura', 'online', 90),
  ('heures', 'Heures', 'lesson_course', 'Grand débutant', 25, 'Demander et donner l’heure avec les formulations de base.', 'Demander et donner l’heure.', 'mint', 'online', 100),
  ('verbes-de-base', 'Verbes de base', 'lesson_course', 'Grand débutant', 45, 'Découvrir les verbes courants et les premières formes polies au présent.', 'Utiliser quelques verbes essentiels au présent poli.', 'amber', 'online', 110),
  ('adjectifs', 'Adjectifs', 'lesson_course', 'Grand débutant', 40, 'Décrire une personne, un objet ou une situation avec des adjectifs simples.', 'Décrire clairement avec les adjectifs de base.', 'indigo', 'online', 120),
  ('phrases-utiles-du-quotidien', 'Phrases utiles du quotidien', 'lesson_course', 'Grand débutant', 35, 'Mémoriser des formulations pratiques pour les échanges de tous les jours.', 'Réagir dans des échanges très courants.', 'sakura', 'online', 130)
on conflict (slug) do update
set
  title = excluded.title,
  format = excluded.format,
  level = excluded.level,
  duration_minutes = excluded.duration_minutes,
  description = excluded.description,
  objective = excluded.objective,
  accent = excluded.accent,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.course_lessons (course_id, slug, title, content_type, description, objective, sort_order, status)
select courses.id, lessons.slug, lessons.title, lessons.content_type, lessons.description, lessons.objective, lessons.sort_order, lessons.status
from public.courses
join (
  values
    ('hiragana', 'voyelles', 'Les voyelles', 'lesson', 'Lire et prononcer あ, い, う, え, お.', 'Reconnaître et prononcer les cinq voyelles.', 10, 'online'),
    ('hiragana', 'lignes-k-s-t', 'Les lignes K, S et T', 'lesson', 'Construire les premières syllabes et les lire en rythme.', 'Lire les lignes K, S et T avec régularité.', 20, 'online'),
    ('hiragana', 'premiers-mots', 'Premiers mots en hiragana', 'reading', 'Lire des mots courts et installer les bons réflexes.', 'Lire de petits mots en contexte.', 30, 'online'),
    ('katakana', 'voyelles', 'Les voyelles', 'lesson', 'Lire et prononcer ア, イ, ウ, エ, オ.', 'Reconnaître et prononcer les cinq voyelles en katakana.', 10, 'online'),
    ('katakana', 'mots-etrangers', 'Mots étrangers', 'lesson', 'Repérer les sons utilisés dans les emprunts courants.', 'Comprendre comment les mots étrangers sont adaptés.', 20, 'online'),
    ('katakana', 'lecture-simple', 'Lecture simple', 'reading', 'Lire des mots courts en katakana sans hésiter.', 'Lire des mots en katakana avec plus de fluidité.', 30, 'online'),
    ('presentations', 'bonjour-au-revoir', 'Bonjour et au revoir', 'dialogue', 'Choisir la bonne formule selon le moment et le contexte.', 'Saluer dans une conversation simple.', 10, 'online'),
    ('presentations', 'se-presenter', 'Se présenter', 'dialogue', 'Dire son nom et accueillir une réponse simple.', 'Donner son nom et demander celui de l’autre personne.', 20, 'online'),
    ('presentations', 'phrases-polies', 'Phrases polies', 'culture', 'Utiliser merci, excuse-moi et enchanté naturellement.', 'Employer les formules polies de base au bon moment.', 30, 'online')
) as lessons(course_slug, slug, title, content_type, description, objective, sort_order, status)
on lessons.course_slug = courses.slug
on conflict (course_id, slug) do update
set
  title = excluded.title,
  content_type = excluded.content_type,
  description = excluded.description,
  objective = excluded.objective,
  sort_order = excluded.sort_order,
  status = excluded.status,
  updated_at = now();

insert into public.learning_paths (slug, title, level, description, goal, accent, status, sort_order)
values (
  'debuter-en-japonais',
  'Débuter en japonais',
  'Vrai débutant',
  'Pour les vrais débutants : kana, prononciation, premières structures et phrases utiles du quotidien.',
  'Construire une base naturelle pour lire, écouter et produire ses premières phrases.',
  'indigo',
  'online',
  10
)
on conflict (slug) do update
set
  title = excluded.title,
  level = excluded.level,
  description = excluded.description,
  goal = excluded.goal,
  accent = excluded.accent,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = now();

delete from public.learning_path_courses as links
using public.learning_paths as paths
where links.learning_path_id = paths.id
  and paths.slug = 'debuter-en-japonais';

insert into public.learning_path_courses (learning_path_id, course_id, position)
select learning_paths.id, courses.id, path_courses.position
from public.learning_paths
join (
  values
    ('hiragana', 10),
    ('katakana', 20),
    ('prononciation', 30),
    ('ordre-des-mots', 40),
    ('particules-de-base', 50),
    ('premieres-phrases', 60),
    ('presentations', 70),
    ('nombres', 80),
    ('dates', 90),
    ('heures', 100),
    ('verbes-de-base', 110),
    ('adjectifs', 120),
    ('phrases-utiles-du-quotidien', 130)
) as path_courses(course_slug, position)
on true
join public.courses on courses.slug = path_courses.course_slug
where learning_paths.slug = 'debuter-en-japonais'
on conflict (learning_path_id, course_id) do update
set position = excluded.position;
