-- Schema para o aplicativo de controle financeiro pessoal (Supabase)
-- Execute este script no SQL Editor do Supabase. Revise antes de aplicar em projetos existentes.
-- NÃO exclui tabelas ou dados existentes.

-- Extensão para geração de UUID (geralmente já habilitada no Supabase)
create extension if not exists "pgcrypto";

-- Tabela de receitas
create table if not exists public.receitas (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  valor numeric(12,2) not null check (valor > 0),
  categoria text not null,
  data date not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Tabela de despesas
create table if not exists public.despesas (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  valor numeric(12,2) not null check (valor > 0),
  categoria text not null,
  data date not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Índices úteis para consultas por usuário e período
create index if not exists idx_receitas_user_data on public.receitas (user_id, data desc);
create index if not exists idx_despesas_user_data on public.despesas (user_id, data desc);

-- Habilitar Row Level Security (RLS)
alter table public.receitas enable row level security;
alter table public.despesas enable row level security;

-- Políticas para RECEITAS (criação idempotente: remove se existir e recria)
drop policy if exists "Usuarios podem selecionar suas receitas" on public.receitas;
create policy "Usuarios podem selecionar suas receitas"
  on public.receitas
  for select
  using (auth.uid() = user_id);

drop policy if exists "Usuarios podem inserir suas receitas" on public.receitas;
create policy "Usuarios podem inserir suas receitas"
  on public.receitas
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuarios podem atualizar suas receitas" on public.receitas;
create policy "Usuarios podem atualizar suas receitas"
  on public.receitas
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuarios podem excluir suas receitas" on public.receitas;
create policy "Usuarios podem excluir suas receitas"
  on public.receitas
  for delete
  using (auth.uid() = user_id);

-- Políticas para DESPESAS
drop policy if exists "Usuarios podem selecionar suas despesas" on public.despesas;
create policy "Usuarios podem selecionar suas despesas"
  on public.despesas
  for select
  using (auth.uid() = user_id);

drop policy if exists "Usuarios podem inserir suas despesas" on public.despesas;
create policy "Usuarios podem inserir suas despesas"
  on public.despesas
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuarios podem atualizar suas despesas" on public.despesas;
create policy "Usuarios podem atualizar suas despesas"
  on public.despesas
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuarios podem excluir suas despesas" on public.despesas;
create policy "Usuarios podem excluir suas despesas"
  on public.despesas
  for delete
  using (auth.uid() = user_id);

-- Observações:
-- 1) Se as tabelas já existirem com estrutura diferente, compare colunas/tipos/restrições
--    antes de aplicar ALTER TABLE manualmente. Não use DROP TABLE neste cenário.
-- 2) As políticas acima garantem que cada usuário autenticado acesse apenas seus próprios registros.
-- 3) Em inserts/updates pelo frontend, envie sempre o user_id do usuário autenticado.
