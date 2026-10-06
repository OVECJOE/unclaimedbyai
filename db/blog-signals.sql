create table blog_signals (
  id bigserial primary key,
  post_id bigint not null references blog_posts (id) on delete cascade,
  comment_id bigint references blog_comments (id) on delete cascade,
  fingerprint text not null,
  created_at timestamptz not null default now()
);
create unique index blog_signals_post_uq on blog_signals (post_id, fingerprint)
  where comment_id is null;
create unique index blog_signals_comment_uq on blog_signals (comment_id, fingerprint)
  where comment_id is not null;
create index blog_signals_post_idx on blog_signals (post_id, created_at);
