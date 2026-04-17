# PADCOM GLOBAL - TODO

## Banco de Dados e Schema
- [x] Schema de pacientes (patients)
- [x] Schema de consultoras/profissionais (consultants)
- [x] Schema de perguntas dinâmicas da anamnese (anamnesis_questions)
- [x] Schema de respostas da anamnese (anamnesis_sessions + anamnesis_responses)
- [x] Schema de relatos diários do paciente (daily_reports)
- [x] Schema de prescrições/fórmulas (prescriptions)
- [x] Schema de componentes das fórmulas (prescription_components)
- [x] Schema de relatos vinculados a prescrições (prescription_reports)
- [x] Schema de alertas automáticos (alerts)
- [x] Schema de regras de alerta (alert_rules)
- [x] Schema de sessões de acompanhamento (follow_up_sessions)
- [x] Schema de exames (exams)
- [x] Schema de log de auditoria (audit_log)
- [x] Schema de links de acesso do paciente (accessToken no patients)
- [x] Migrações SQL aplicadas

## Backend - APIs tRPC
- [x] CRUD de pacientes
- [x] CRUD de consultoras com toggle de acesso
- [x] CRUD de perguntas da anamnese (dinâmico)
- [x] API de anamnese integrativa (salvar/carregar respostas)
- [x] API de anamnese estética (salvar/carregar respostas)
- [x] API de relatos diários (com período manhã/tarde/noite)
- [x] API de prescrições e fórmulas
- [x] API de relatos vinculados a prescrições
- [x] Motor de alertas automáticos categorizáveis (reação adversa + exame fora do range)
- [x] API de sessões de acompanhamento
- [x] API de exames e evolução
- [x] API de geração de link único por paciente
- [x] API de dashboard consolidado (stats)
- [x] API de log de auditoria

## Frontend - Dashboard Global (PADCOM GLOBAL)
- [x] Tema visual elegante e sofisticado (tipografia Inter, paleta teal/emerald)
- [x] Layout com sidebar (DashboardLayout) para painel médico
- [x] Página inicial do dashboard com visão consolidada (stats, alertas, relatos)
- [x] Gestão de consultoras com toggle ON/OFF
- [x] CRUD de perguntas da anamnese pelo dashboard
- [x] Motor de alertas com categorização e encaminhamento
- [x] Geração de link WhatsApp pré-configurado por paciente
- [x] Página de pacientes com busca e CRUD
- [x] Página de detalhe do paciente com tabs
- [x] Página de prescrições com componentes
- [x] Página de exames
- [x] Página de sessões de acompanhamento
- [x] Página de auditoria

## Frontend - 3 Vias de Anamnese
- [x] Via 1 - Anamnese Integrativa: formulário multietapas autoguiado
- [x] Via 2 - Anamnese Estética: formulário paralelo independente
- [x] Via 3 - Relatos Diários: interface responsiva com seletor manhã/tarde/noite

## Frontend - Interface do Paciente
- [x] Página responsiva de acesso do paciente (via link único /portal/:token)
- [x] Visualização de fórmulas prescritas ativas
- [x] Registro de reações/efeitos por fórmula com alerta automático
- [x] Formulário de relatos diários (sono, energia, foco, libido, pressão, peso)
- [x] Seletor de período (manhã/tarde/noite) com data

## Acompanhamento Longitudinal
- [x] Score clínico calculado automaticamente a partir dos relatos diários (média por eixo)
- [x] Gráficos de evolução de sintomas (30/60/90 dias) com Recharts
- [x] Gráficos de evolução de exames
- [x] Radar de score clínico por eixo (sono, energia, foco, libido, etc.)
- [x] Gráficos de pressão arterial e peso
- [x] Endpoint patientTimeline no dashboard router

## Testes
- [x] Testes de estrutura dos routers (38 testes passando)
- [x] Testes de validação de input (categorias, enums e campos chave)
- [x] Testes de rotas públicas vs protegidas (getByToken, prescriptionReport.create)
- [x] Testes de roles de consultora (enum validado)
- [x] Testes de categorias de perguntas (integrativa, estetica, relato_diario)
- [x] Testes de períodos de relatos diários (manha, tarde, noite)
- [x] Testes de tipos de relato de prescrição e severidades
- [x] Testes de status de alertas e prioridades de regras
