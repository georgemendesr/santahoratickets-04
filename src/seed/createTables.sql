
-- Criação da tabela events
create table events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  date date not null,
  time time not null,
  location text not null,
  price decimal not null,
  available_tickets integer not null,
  image text not null,
  status text check (status in ('published', 'draft', 'ended')) default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Criação da tabela tickets
create table tickets (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) not null,
  user_id uuid not null,
  purchase_date timestamp with time zone default timezone('utc'::text, now()) not null,
  qr_code text not null,
  used boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Criação da tabela payment_preferences
create table payment_preferences (
  id uuid default gen_random_uuid() primary key,
  init_point text not null,
  ticket_quantity integer not null,
  total_amount decimal not null,
  event_id uuid references events(id) not null,
  user_id uuid not null,
  status text check (status in ('pending', 'approved', 'rejected', 'cancelled')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Adicionando RLS (Row Level Security)
alter table events enable row level security;
alter table tickets enable row level security;
alter table payment_preferences enable row level security;

-- Criando políticas de acesso
create policy "Eventos são visíveis para todos"
  on events for select
  to anon
  using (true);

create policy "Tickets são visíveis para o próprio usuário"
  on tickets for select
  to anon
  using (true);

create policy "Payment preferences são visíveis para o próprio usuário"
  on payment_preferences for select
  to anon
  using (true);
