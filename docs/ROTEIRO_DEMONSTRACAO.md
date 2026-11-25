# Roteiro de demonstração (5 a 10 minutos)

> Este roteiro organiza a apresentação do aplicativo. Ajuste os tempos conforme necessário e utilize **dados reais** cadastrados durante a demonstração (não use capturas ou resultados inventados).

## 1. Introdução (30–60s)
- Apresentar o nome do aplicativo: **Finança App**.
- Objetivo: controle financeiro pessoal com receitas, despesas, saldo e dashboard com gráficos, usando **Ionic + Vue 3 + TypeScript + Supabase**.

## 2. Login e autenticação (1–2 min)
- Mostrar a **tela de login** (campos e-mail/senha, visualizar/ocultar senha, validações).
- Demonstrar tratamento de erro (ex.: credenciais inválidas) se apropriado.
- Realizar login com um usuário de teste e mostrar o redirecionamento para o **Dashboard**.
- (Opcional) Mostrar rapidamente a **tela de cadastro** e explicar o fluxo de confirmação de e-mail, caso esteja habilitada no Supabase.

## 3. Cadastro de receitas (1–2 min)
- Acessar a aba **Receitas**.
- Cadastrar uma nova receita (descrição, valor em R$, categoria, data).
- Mostrar: total de receitas, listagem, formatação em reais/data, estado de sucesso.
- Demonstrar **edição** de uma receita e atualização da lista/total.
- Demonstrar **exclusão** com confirmação e atualização dos dados.

## 4. Cadastro de despesas (1–2 min)
- Acessar a aba **Despesas**.
- Cadastrar uma nova despesa em uma categoria (ex.: Alimentação).
- Mostrar total, listagem e operações de **edição** e **exclusão** (com confirmação).
- Destacar que os dados são persistidos no Supabase e vinculados ao usuário autenticado.

## 5. Dashboard e gráficos (2–3 min)
- Acessar o **Dashboard** e apresentar:
  - Cards: **Total de receitas**, **Total de despesas**, **Saldo atual** (cores e valores atualizados).
  - **Gráfico de pizza**: distribuição das despesas por categoria (legendas, valores/percentuais).
  - **Gráfico de barras**: comparação de receitas x despesas por mês (ordem cronológica).
  - Indicadores: **maior categoria de gasto**, **quantidade total de lançamentos**, **percentual de despesas em relação às receitas**.
- Mostrar atualização automática após criar/editar/excluir lançamentos (pode alternar entre abas para evidenciar).

## 6. Funcionalidades extras (1–2 min)
- **Filtro por período:** demonstrar opções (Todos, Mês atual, Mês anterior, Ano atual, Período personalizado) e como listas/totais/indicadores/gráficos são atualizados conforme o período.
- **Modo escuro:** alternar em **Configurações**, mostrar adaptação das telas e gráficos, e comentar que a preferência é salva (Capacitor Preferences).

## 7. Encerramento (30s)
- Mostrar o **e-mail do usuário** em Configurações e realizar **logout** (redirecionamento para login).
- Reforçar segurança (RLS no Supabase, dados por usuário) e organização do projeto.

## Checklist rápido para a apresentação
- [ ] Projeto Supabase configurado (`.env` preenchido e `schema.sql` aplicado)
- [ ] Usuário de teste autenticado
- [ ] Pelo menos algumas receitas e despesas cadastradas para popular gráficos
- [ ] Conexão com internet disponível (para Supabase)
- [ ] Capturas de tela reais preparadas separadamente (se exigido no PDF)
