create table blog_comments (
  id bigserial primary key,
  post_id bigint not null references blog_posts (id) on delete cascade,
  parent_id bigint references blog_comments (id) on delete cascade,
  author_name text not null check (
    char_length(author_name) between 1 and 60
  ),
  body text not null check (char_length(body) between 1 and 2000),
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'rejected')
  ),
  created_at timestamptz not null default now(),
  check (parent_id is null or parent_id <> id)
);
create index blog_comments_post_idx on blog_comments (post_id, created_at);
create index blog_comments_status_idx on blog_comments (status, created_at desc);
