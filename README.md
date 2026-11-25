# Finança App

## Descrição do projeto
Aplicativo mobile de controle financeiro pessoal desenvolvido com Ionic Framework, Vue.js 3, TypeScript e Supabase. O app permite cadastrar receitas e despesas, acompanhar saldo e visualizar indicadores financeiros por meio de dashboard e gráficos interativos, com dados reais persistidos no Supabase.

## Objetivo
Permitir que o usuário autenticado gerencie suas finanças pessoais de forma simples e segura, registrando receitas e despesas, consultando totais e analisando informações financeiras por período.

## Tecnologias utilizadas
- **Ionic Framework** (`@ionic/vue`)
- **Vue.js 3** (Composition API, `<script setup lang="ts">`)
- **TypeScript**
- **Supabase** (`@supabase/supabase-js`) — banco de dados e autenticação
- **Supabase Authentication** (e-mail e senha)
- **Vue ApexCharts** (`vue3-apexcharts` / `apexcharts`)
- **Capacitor** (execução mobile/Android)
- **Capacitor Preferences** (persistência da preferência de tema)
- **Vite** (build/dev server)
- **Ionicons**

## Funcionalidades obrigatórias
- **Autenticação completa (Supabase Auth):** login, cadastro, validações, exibir/ocultar senha, mensagens de erro compreensíveis, indicador de carregamento, tratamento de confirmação de e-mail (quando habilitada), controle de sessão, proteção de rotas e logout com redirecionamento.
- **Banco de dados Supabase:** tabelas `receitas` e `despesas` com campos obrigatórios, `id` UUID (PK), `user_id` (FK para `auth.users`), restrição `valor > 0`, RLS habilitado e políticas de `SELECT/INSERT/UPDATE/DELETE` para que cada usuário acesse apenas seus próprios registros. Script em `supabase/schema.sql`.
- **CRUD de receitas:** cadastro, listagem, edição e exclusão com descrição, valor (R$), categoria (Salário, Freelance, Investimentos, Outros), data, total do período, formatação em BRL/data pt-BR, confirmação de exclusão, mensagens de sucesso/erro e estado vazio.
- **CRUD de despesas:** cadastro, listagem, edição e exclusão com categorias (Alimentação, Transporte, Moradia, Educação, Lazer, Saúde, Outros), total, formatação, confirmação, feedback e estado vazio.
- **Dashboard financeiro:** cards de Total de receitas, Total de despesas e Saldo atual (cores dinâmicas); gráfico de pizza de despesas por categoria; gráfico de barras comparando receitas x despesas por mês; indicadores de maior categoria de gasto, quantidade total de lançamentos e percentual de despesas em relação às receitas (com tratamento de divisão por zero). Atualização automática após alterações.
- **Navegação:** Ionic Tabs com Dashboard, Receitas, Despesas e Configurações; rotas protegidas com Vue Router.
- **Configurações:** exibição do e-mail do usuário autenticado, alternância de tema claro/escuro e botão de logout.
- **Interface:** design responsivo em português brasileiro, componentes Ionic, valores em BRL e datas no padrão brasileiro.

## Funcionalidades extras (bônus)
1. **Modo escuro**
   - Alternância entre modo claro e escuro na tela de Configurações.
   - Tema aplicado globalmente (incluindo componentes e gráficos ApexCharts).
   - Preferência salva com **Capacitor Preferences** e restaurada ao abrir o aplicativo.

2. **Filtro por período**
   - Opções: Todos os registros, Mês atual, Mês anterior, Ano atual e Período personalizado.
   - Atualiza listas, totais, indicadores e gráficos conforme o período selecionado.
   - O filtro é aplicado na visualização (não exclui nem modifica registros no banco).

## Estrutura do projeto
```text
src/
  components/
    ExpensePieChart.vue
    FinancialCard.vue
    MonthlyBarChart.vue
    PeriodFilter.vue
    TransactionForm.vue
    TransactionList.vue
  composables/
    useAuth.ts
    useFinance.ts
    useTheme.ts
  router/
    index.ts
  services/
    authService.ts
    despesasService.ts
    receitasService.ts
    supabase.ts
  theme/
    variables.css
  types/
    financeiro.ts
  utils/
    format.ts
  views/
    ConfiguracoesPage.vue
    DashboardPage.vue
    DespesasPage.vue
    LoginPage.vue
    ReceitasPage.vue
    RegisterPage.vue
    TabsPage.vue
  App.vue
  main.ts
  vite-env.d.ts
supabase/
  schema.sql
docs/
  ROTEIRO_DEMONSTRACAO.md
  ESTRUTURA_PDF_AVALIACAO.md
```

## Configuração do Supabase
1. **Criar projeto no Supabase**
   - Acesse [https://supabase.com](https://supabase.com), crie uma conta (se necessário) e clique em **New project**.
   - Escolha organização, nome do projeto, senha forte do banco e região. Aguarde a criação.

2. **Obter credenciais (URL e chave anônima)**
   - No painel do projeto, vá em **Project Settings > API**.
   - Copie a **Project URL** e a chave **anon public** (`anon` key).
   - **Nunca** utilize a chave `service_role` no frontend.

3. **Criar tabelas e políticas de segurança (RLS)**
   - No painel, abra **SQL Editor**.
   - Cole e execute o conteúdo do arquivo [`supabase/schema.sql`](supabase/schema.sql).
   - O script cria (se não existirem) as tabelas `public.receitas` e `public.despesas`, restrições, índices, habilita RLS e cria políticas de `SELECT`, `INSERT`, `UPDATE` e `DELETE` vinculadas a `auth.uid() = user_id`.
   - **Se as tabelas já existirem:** compare a estrutura atual (colunas, tipos, constraints e FKs) com o script antes de aplicar alterações manuais. O script usa `CREATE TABLE IF NOT EXISTS` e recria políticas de forma idempotente, mas **não remove tabelas nem dados**.

4. **Configurar autenticação (Auth)**
   - Vá em **Authentication > Providers > Email** e verifique se o login por e-mail está habilitado.
   - **Confirmação de e-mail:** em **Authentication > Providers > Email** (ou configurações de confirmação, conforme a interface do Supabase), você pode habilitar ou desabilitar "Confirm email".
     - **Se habilitada:** após o cadastro, o Supabase envia um e-mail de confirmação e pode não retornar sessão imediata. O app exibe mensagem orientando o usuário a confirmar o e-mail antes de entrar.
     - **Se desabilitada:** o cadastro pode autenticar automaticamente (sessão criada) e o app redireciona para o dashboard.
   - Em **Authentication > URL Configuration**, configure URLs de redirecionamento se necessário para seu ambiente (desenvolvimento/produção).

5. **Verificar RLS e acesso**
   - Em **Table Editor**, confirme que as tabelas `receitas` e `despesas` existem e que RLS está ativo.
   - Teste com dois usuários diferentes para garantir isolamento dos dados.

## Configuração das variáveis de ambiente
1. Crie um arquivo `.env` na raiz do projeto (ele **não** deve ser versionado; já está no `.gitignore`).
2. Use como base o arquivo `.env.example`:
   ```env
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
   ```
3. Reinicie o servidor de desenvolvimento após alterar o `.env`.

## Instruções para instalação
Pré-requisitos: **Node.js** (LTS recomendado) e **npm** instalados.

```bash
npm install
```

## Instruções para execução no navegador
```bash
npm install
ionic serve
```
Alternativa (Vite):
```bash
npm run dev
```

## Instruções para execução no Android Studio
Pré-requisitos: **Android Studio**, SDK/Platform Tools configurados, e ambiente Capacitor/Android preparado.

1. Instale dependências e gere o build web:
   ```bash
   npm install
   ionic build
   ```
   (ou `npm run build`)

2. Sincronize com o projeto Android:
   ```bash
   npx cap sync android
   ```

3. Abra no Android Studio:
   ```bash
   npx cap open android
   ```

4. Execute em um emulador ou dispositivo físico pelo Android Studio.

### Caso a plataforma Android ainda não exista
Se a pasta `android/` não estiver presente no projeto, adicione a plataforma com:
```bash
npm install
npx cap add android
ionic build
npx cap sync android
npx cap open android
```
> Observação: `npx cap add android` cria a estrutura nativa. Após isso, revise permissões e configurações conforme necessário (evite alterações desnecessárias).

### Verificações de compatibilidade Android (orientações)
- **Permissão de internet:** projetos Capacitor Android normalmente incluem acesso à rede; verifique `android/app/src/main/AndroidManifest.xml` e garanta a permissão de internet (`android.permission.INTERNET`) se o template/plataforma não a incluir.
- **Conexão com Supabase no Android:** use HTTPS na `VITE_SUPABASE_URL`, garanta que o dispositivo/emulador tenha internet e que o `capacitor.config.ts` esteja com `server.androidScheme` adequado (configurado como `https` neste projeto).
- **Build/sincronização:** sempre rode `ionic build` (ou `npm run build`) antes de `npx cap sync android` para atualizar os assets web em `dist/`.

## Principais desafios técnicos identificados
- **Sincronização de estado entre abas/telas:** garantir que cadastros, edições e exclusões reflitam imediatamente em listas, totais, indicadores e gráficos (resolvido com estado/composables reativos e recarregamento após operações).
- **Filtros por período sem alterar dados no banco:** aplicar filtros apenas na camada de visualização, mantendo consistência entre dashboard, receitas e despesas.
- **Tratamento de casos de borda:** divisão por zero no percentual de despesas/receitas, estados vazios em gráficos e listas, e validações de formulário (valores > 0, datas/categorias obrigatórias).
- **Autenticação e sessão no Supabase:** lidar com cenários de e-mail não confirmado, erros de credenciais e restauração de sessão com rotas protegidas.
- **Persistência de tema no mobile:** integrar tema claro/escuro do app/gráficos com armazenamento via Capacitor Preferences.
- **Ambiente de build:** execução de build/testes depende de Node.js/npm e, para Android, do ambiente SDK/Android Studio corretamente configurado.

## Espaço para capturas de tela
Adicione aqui capturas de tela reais do aplicativo em execução:

- **Login:**  
  _(inserir imagem)_

- **Cadastro:**  
  _(inserir imagem)_

- **Dashboard (cards e indicadores):**  
  _(inserir imagem)_

- **Gráfico de pizza (despesas por categoria):**  
  _(inserir imagem)_

- **Gráfico de barras (receitas x despesas por mês):**  
  _(inserir imagem)_

- **Tela de receitas:**  
  _(inserir imagem)_

- **Tela de despesas:**  
  _(inserir imagem)_

- **Configurações (modo escuro / logout):**  
  _(inserir imagem)_

## Documentação complementar da avaliação
- Roteiro de demonstração (5 a 10 minutos): [`docs/ROTEIRO_DEMONSTRACAO.md`](docs/ROTEIRO_DEMONSTRACAO.md)
- Estrutura para documento PDF da avaliação: [`docs/ESTRUTURA_PDF_AVALIACAO.md`](docs/ESTRUTURA_PDF_AVALIACAO.md)
