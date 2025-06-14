
# Backend Structure Map

## Estrutura Reorganizada

```
/functions
  /_shared/              # Utilitários compartilhados
    - auth.ts           # Validação de autenticação e roles
    - responses.ts      # Respostas padronizadas e CORS
    - validation.ts     # Validações de entrada
  
  /tickets/
    /validate-ticket/   # Validação de ingressos por QR Code
      - index.ts
  
  /payments/
    /create-payment-preference/  # Criação de preferências de pagamento
      - index.ts
    /webhook-payment/   # Webhook do MercadoPago (mantido na raiz)
      - index.ts
  
  /admin/
    /dashboard-summary/ # Resumo estatístico para admins
      - index.ts
  
  /users/
    /get-profile/       # Perfil do usuário autenticado
      - index.ts
  
  # Funções na raiz (legado - manter por compatibilidade)
  /create-payment/      # Processamento de pagamentos
  /send-email/          # Envio de emails
  /send-ticket-email/   # Envio de ingressos por email
  /webhook-payment/     # Webhook principal
```

## Funções Documentadas

### 🎫 **Tickets**

#### `validate-ticket`
- **Descrição**: Valida ingressos escaneados via QR Code
- **Autenticação**: Requerida
- **Parâmetros**: `{ qr_code: string, validator_user_id?: string }`
- **Resposta**: `{ success: boolean, data: { message, ticket } }`
- **Status Codes**: 200 (sucesso), 404 (não encontrado), 409 (já usado)

### 💳 **Payments**

#### `create-payment-preference`
- **Descrição**: Cria preferência de pagamento no MercadoPago
- **Autenticação**: Requerida
- **Parâmetros**: `{ eventId, batchId, quantity, userId }`
- **Resposta**: `{ success: boolean, data: { init_point, preference_id } }`
- **Status Codes**: 200 (sucesso), 404 (não encontrado), 400 (erro validação)

### 👑 **Admin**

#### `dashboard-summary`
- **Descrição**: Estatísticas resumidas para dashboard administrativo
- **Autenticação**: Requerida (Admin only)
- **Parâmetros**: Nenhum
- **Resposta**: `{ success: boolean, data: DashboardSummary }`
- **Status Codes**: 200 (sucesso), 401 (não autorizado), 403 (não admin)

### 👤 **Users**

#### `get-profile`
- **Descrição**: Perfil completo do usuário autenticado
- **Autenticação**: Requerida
- **Parâmetros**: Nenhum
- **Resposta**: `{ success: boolean, data: UserProfile }`
- **Status Codes**: 200 (sucesso), 401 (não autorizado)

## Utilitários Centralizados

### `_shared/auth.ts`
- `createAuthenticatedClient()`: Cliente Supabase autenticado
- `validateAuthToken()`: Validação de token JWT
- `validateAdminRole()`: Verificação de permissões admin

### `_shared/responses.ts`
- `successResponse()`: Resposta padronizada de sucesso
- `errorResponse()`: Resposta padronizada de erro
- `handleCors()`: Headers CORS
- `corsHeaders`: Headers CORS padrão

### `_shared/validation.ts`
- `validateRequiredFields()`: Validação de campos obrigatórios
- `validateEmail()`: Validação de formato de email
- `validateUUID()`: Validação de formato UUID

## Próximos Passos

1. **Migrar funções legado** para nova estrutura
2. **Criar testes unitários** para utilitários
3. **Implementar rate limiting** em funções críticas
4. **Adicionar logging estruturado** com níveis de log
5. **Documentar APIs** com OpenAPI/Swagger
