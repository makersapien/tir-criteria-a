-- create_responses_table.sql

create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  strand text not null,
  content text,
  updated_at timestamp with time zone default now(),
  unique(student_id, strand)
);

-- Optional: Enable RLS for secure student-specific access
alter table responses enable row level security;

-- Sample RLS policy (adjust logic for authenticated users)
create policy "Students can access their own responses"
on responses for all
using (auth.uid()::text = student_id);
