# Plano: Configuração de API via UI

Adicionar um campo na página de Integrações para que o usuário possa configurar seu token da Apify diretamente pela interface, salvando-o de forma segura no banco de dados (Lovable Cloud).

## Alterações Técnicas

- **Banco de Dados**: Criar uma tabela `user_settings` para armazenar configurações globais do app (como o token da Apify).
- **Backend (Server Functions)**:
    - Criar `saveApifyToken` para persistir o token.
    - Atualizar `getIntegrationStatus` para verificar tanto o banco quanto o `process.env`.
    - Atualizar `getApifyConfig` para priorizar o token do banco de dados (se disponível).
- **Frontend**:
    - Adicionar um formulário de "Configuração Manual" na página `/configuracoes`.
    - Usar `sonner` para feedback de sucesso/erro.

## Detalhes para o usuário

- O campo de API Token agora estará disponível em **Integrações**.
- Tokens salvos via interface são armazenados no seu banco de dados seguro.
- Você poderá testar a conexão imediatamente após salvar.

## Segurança

- O token é armazenado no banco de dados e acessado apenas no servidor através de `createServerFn`.
- Nunca expomos o token no lado do cliente (browser).
- Implementaremos RLS (Row Level Security) para garantir que as configurações sejam privadas.
