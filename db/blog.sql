create table blog_editors (
  id bigserial primary key,
  email text not null,
  name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);
create unique index blog_editors_email_uq on blog_editors (lower(email));

create table blog_login_tokens (
  token_hash text primary key,
  editor_id bigint not null references blog_editors (id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index blog_login_tokens_editor_idx on blog_login_tokens (editor_id, created_at);

create table blog_posts (
  id bigserial primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  excerpt text not null default '',
  cover_image_url text,
  body_mdx text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  author_id bigint not null references blog_editors (id),
  seo_title text,
  seo_description text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'published' or published_at is not null)
);
create index blog_posts_status_published_idx on blog_posts (status, published_at desc);
create index blog_posts_tags_idx on blog_posts using gin (tags);

create table blog_post_revisions (
  id bigserial primary key,
  post_id bigint not null references blog_posts (id) on delete cascade,
  title text not null,
  body_mdx text not null,
  edited_by bigint not null references blog_editors (id),
  created_at timestamptz not null default now()
);
create index blog_post_revisions_post_idx on blog_post_revisions (post_id, created_at desc);

create table blog_slug_redirects (
  old_slug text primary key check (old_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  post_id bigint not null references blog_posts (id) on delete cascade,
  created_at timestamptz not null default now()
);

create function blog_set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger blog_posts_set_updated_at before update on blog_posts
  for each row execute function blog_set_updated_at();

-- First editor: replace with your own details, then run once.
-- insert into blog_editors (email, name) values ('you@example.com', 'Your Name');
