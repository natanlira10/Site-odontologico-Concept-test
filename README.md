# Clínica odontológica — Vue + NestJS + PostgreSQL

## Executar

Node.js 20.19+ e npm. Execute na raiz do projeto:

```bash
cd '/home/natanlira10/Documents/Programação/Meus projetos/teste-singlepage'
npm ci
npm run setup
npm run db:local
```

Mantenha o PostgreSQL aberto nesse terminal. Os dados persistem em `.local-postgres/`.
Alternativa com Docker: `npm run db:up`, em vez de `npm run db:local`. Não execute ambos na mesma porta.

Em outro terminal, na mesma pasta:

```bash
npm run db:migrate
npm run db:seed
npm run backend:dev
```

Em um terceiro terminal, na mesma pasta:

```bash
npm run dev
```

- Front-end: http://localhost:3000
- API: http://localhost:3001/api
- Saúde: http://localhost:3001/api/health
- Administrador inicial: `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env` local, criado com permissão `0600`.
- Pacientes podem se cadastrar pela interface. Senhas: 12–128 caracteres.
- O seed de desenvolvimento cria um dentista, uma avaliação de 30 minutos/R$150 e horários nos próximos 14 dias úteis, das 09h às 17h de Bahia.
- `setup` complementa variáveis ausentes; `seed` preserva usuários e senhas existentes. Nenhum segredo real está nos arquivos de exemplo.

## Organização

```text
backend/
  src/auth/       # Cadastro, login, sessão revogável, autorização e rate limit
  src/catalog/    # Dentistas, tratamentos e habilitações
  src/schedule/   # Janelas de atendimento e disponibilidade
  src/bookings/   # Reserva, reagendamento, cancelamento e conclusão
  src/database/  # Pool e transações PostgreSQL
  src/common/    # Validação Zod e respostas de erro
  migrations/    # SQL versionado com checksum e lock de migração
  scripts/       # Migração, provisionamento e limpeza de sessões expiradas
  test/          # Testes HTTP, concorrência real e integração Vue
frontend-client/ # Cliente TypeScript reutilizável, sem dependência de framework
src/services/api.ts
src/composables/useBooking.ts
```

## Contrato HTTP

Prefixo `/api`. Autenticação: `Authorization: Bearer <accessToken>`.
Login/cadastro retornam `{ user, accessToken, expiresAt }`. O cliente guarda o token apenas em memória; recarregar a página exige novo login. Logout revoga a sessão no banco.

| Método | Rota | Acesso |
|---|---|---|
| POST | `/auth/register` | Público: `{name,email,password,phone?,cpf?}` |
| POST | `/auth/login` | Público: `{email,password}` |
| GET / POST | `/auth/me` / `/auth/logout` | Autenticado |
| GET | `/dentists`, `/treatments` | Público |
| POST | `/dentists` | Admin: `{name}` |
| POST | `/treatments` | Admin: `{name,durationMinutes,priceCents}` |
| POST | `/dentists/:id/treatments/:treatmentId` | Admin |
| GET | `/availability?dentistId=...&treatmentId=...&from=...&to=...` | Público; intervalo máximo de 31 dias |
| GET | `/schedule/:dentistId?from=...&to=...` | Admin/dentista responsável |
| POST | `/schedule` | Admin/dentista responsável: `{dentistId,startsAt,endsAt}` |
| DELETE | `/schedule/:id` | Admin/dentista responsável; bloqueado se houver consultas |
| POST | `/appointments` | Autenticado; exige `Idempotency-Key` UUID |
| GET | `/appointments?page=1&limit=25` | Paciente: próprias reservas; dentista: própria agenda; admin: todas |
| PATCH | `/appointments/:id/reschedule` | Titular/admin/dentista responsável: `{startsAt}` |
| PATCH | `/appointments/:id/cancel` | Titular/admin/dentista responsável |
| PATCH | `/appointments/:id/complete` | Admin/dentista responsável; somente após término |

Reserva: `{dentistId,treatmentId,startsAt,patientPhone?,patientCpf?,notes?,isFirstVisit?}`.
Listagem aceita também `from`, `to`, `dentistId`; limite máximo de 100 registros/página.
Erros: `{success:false,error,code}`; conflitos retornam HTTP 409.

## Gestão protegida de consultas e horários

Aplique a atualização com `npm run db:migrate`. A migração `003-dentist-management.sql` preserva os dados existentes e adiciona vínculo de conta/dentista, bloqueios e auditoria de disponibilidade.

Todas as rotas `/management` exigem sessão de **admin ou dentist**. Pacientes recebem 403; sessões ausentes/expiradas, 401. Dentistas veem/alteram somente sua própria agenda; admin pode gerenciar todos. O papel e o vínculo são consultados no banco em cada requisição. Cadastro público não aceita papel nem vínculo de dentista.

| Método | Rota | Entrada/comportamento |
|---|---|---|
| POST | `/dentists/:dentistId/account` | Somente admin: `{email,password}`; cria conta dentist vinculada, sem promover paciente existente |
| GET | `/management/appointments` | `page`, `limit`, `from`, `to`, `dentistId`, `status`; status padrão `confirmed`; inclui nome/contato do paciente |
| PATCH | `/management/appointments/:id/reschedule` | `{startsAt}`; mantém duração/preço, verifica conflitos e registra auditoria |
| GET | `/management/availability` | `from`, `to`, `dentistId?`; lista intervalos bloqueados; máximo 31 dias |
| PATCH | `/management/availability` | `{dentistId?,startsAt,endsAt,available}`; `false` bloqueia, `true` reabre |

Dentistas podem omitir `dentistId`; o servidor usa o vínculo da sessão. Admin precisa informar o dentista ao consultar/alterar disponibilidade. Reabrir remove somente o bloqueio do intervalo solicitado, preservando bloqueios nas laterais; não cancela consultas nem cria uma janela de trabalho. Para abrir atendimento fora do expediente atual, crie uma janela com `POST /schedule`.

Os intervalos devem estar no futuro, dentro de uma janela de atendimento, alinhados à grade de 15 minutos e durar até 12 horas. Bloquear um intervalo ocupado retorna 409. Reservas e reagendamentos respeitam os bloqueios inclusive sob concorrência. Repetir o mesmo estado é idempotente; mudanças são auditadas em `availability_events`.

```ts
// Sessão de administrador: provisionar a conta do profissional.
await api.createDentistAccount(dentistId, { email, password });

// Sessão do dentista: o escopo é inferido da conta.
await api.login(email, password);
const appointments = await api.managedAppointments({ page: 1, limit: 100 });
await api.rescheduleManagedAppointment(appointmentId, startsAt);
await api.setAvailability({ startsAt, endsAt, available: false });
await api.setAvailability({ startsAt, endsAt, available: true });
```

O painel Vue usa a conta autenticada, as rotas reais e os erros do servidor. Não há PIN local nem fallback que simule sucesso em operações recusadas.

## Integração

O Vue já chama a API real. `vite.config.ts` encaminha `/api` à porta 3001; `.env` usa `VITE_API_BASE_URL=/api`. O antigo modo simulado não participa de login ou reserva.

Para outro front-end, importe `ClinicApi` de `frontend-client/src/index.ts`:

```ts
const api = new ClinicApi('http://localhost:3001/api');
await api.login(email, password);
const slots = await api.availability({ dentistId, treatmentId, from, to });
const key = crypto.randomUUID(); // Conserve para repetir esta mesma tentativa.
await api.book({ dentistId, treatmentId, startsAt: slots[0].startsAt }, key);
```

## Regras e validação

- Datas ISO 8601 exigem `Z` ou offset; armazenamento `timestamptz`. A interface exibe horários de Bahia, UTC−03.
- Janelas explícitas de até 12 horas; grade de 15 minutos. Para almoço/ausências, crie janelas separadas. Para alterar uma janela, remova e recrie; reservas existentes precisam ser canceladas/reagendadas antes.
- Antecedência padrão: 30 minutos. Horizonte: 180 dias. Duração/preço são calculados no servidor e preservados na reserva.
- Exclusions PostgreSQL impedem sobreposição por dentista **e paciente**. Intervalos adjacentes são permitidos. Locks serializam alterações de agenda com reservas.
- Repetição da mesma chave retorna a reserva existente; alterar o payload com a mesma chave retorna 409. Reserva e auditoria são gravadas na mesma transação.
- Scrypt com salt, tokens aleatórios armazenados como hash, autorização por titular/admin, SQL parametrizado, CORS explícito, limite de body de 16 KB e rate limit compartilhado no PostgreSQL.

```bash
npm run check  # Build Vue/API/cliente + lint + 35 testes com PostgreSQL temporário
```

## Produção

Use PostgreSQL gerenciado ou persistente, migrações e conta de aplicação com permissões mínimas; o PostgreSQL embutido é apenas para desenvolvimento/testes. Configure `NODE_ENV=production`, `DATABASE_URL` com TLS verificado, `CORS_ORIGINS` e HTTPS no proxy. Não exponha a porta do banco. Sirva `dist/` e encaminhe `/api` à API; `npm run build && npm start` executa a API compilada.

O Express não confia em `X-Forwarded-For` por padrão. Se houver proxy, configure apenas os IPs/sub-redes confiáveis em `backend/src/app.ts` para limites por IP do cliente. Agende `npm run db:cleanup` diariamente. Após provisionar o admin, remova `ADMIN_PASSWORD` do ambiente. Não há envio automático de mensagens, processamento de pagamento ou prontuário eletrônico nesta entrega.

Referências: [NestJS Authentication](https://docs.nestjs.com/security/authentication), [PostgreSQL range/exclusion constraints](https://www.postgresql.org/docs/15/rangetypes.html).
# Site-odontologico-Concept-test
