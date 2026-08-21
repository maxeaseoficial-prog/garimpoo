create table public.user_settings (
    id uuid primary key default gen_random_uuid(),
    key text not null unique,
    value text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

grant select, insert, update, delete on public.user_settings to authenticated;
grant all on public.user_settings to service_role;

alter table public.user_settings enable row level security;

create policy "Usuários podem gerenciar suas próprias configurações"
on public.user_settings
for all
to authenticated
using (true)
with check (true);
