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

## ═══════════════════════════════════════════════════════════
## EVOLUÇÃO V2 — Integração Anamnesis-Helper + Roadmap V16
## ═══════════════════════════════════════════════════════════

## PASSO 1 — Motor de Score V15 (Backend)
- [x] Tabela scoring_weights com pesos por código semântico (CARD_DOEN_HASA_001 etc.)
- [x] Tabela scoring_bands com faixas de conduta (Básico 0-20, Intermediário 21-50, Avançado 51-80, Full 81-100)
- [x] Tabela motor_actions com regras determinísticas (HAS→Painel cardiometabólico, Diabetes→Glicemia etc.)
- [x] Tabela clinical_flags para validação humana obrigatória (infarto, AVC, medicamentos contínuos)
- [x] Tabela funnel_status para funil comercial (INICIOU_E_PAROU, CONCLUIU_CLINICO, CONCLUIU_FINANCEIRO, ALTO_INTERESSE)
- [x] Endpoint calculateScore que recebe respostas e retorna score 0-100 + faixa + ações + flags (scoring-engine.ts criado, precisa de testes específicos)
- [x] Lógica de conversão de respostas em pontos brutos (scoring-engine.ts, precisa de testes unitários)

## PASSO 2 — 34 Perguntas Semânticas V15 (Seed + Schema)
- [x] Adicionar campos ao schema de perguntas: code semântico, block clínico, step (1-5), clinicalGoal, commercialGoal, helper, technicalName, weight
- [x] Seed das 34 perguntas dos 5 módulos com todos os metadados (34 perguntas + 16 pesos + 10 ações do motor)
- [x] Microtextos comerciais de transição entre etapas
- [x] Modal "Ver explicação" com technicalName por pergunta

## PASSO 3 — Fluxo de Anamnese do Paciente em 5 Etapas
- [x] Página /anamnese com progress bar de 5 etapas e sticky CTA
- [x] Módulo 1: Dados + clínico básico (9 perguntas)
- [x] Módulo 2: Sintomas funcionais (6 perguntas)
- [x] Módulo 3: Cirurgias, medicamentos, atividade (9 perguntas)
- [x] Módulo 4: Preferências terapêuticas (7 perguntas)
- [x] Módulo 5: Financeiro (3 perguntas + microtextos)
- [x] Página /anamnese/concluido com score animado + faixa + ações + flags
- [x] Autosave em localStorage via useDraft hook
- [x] Modo Demonstração com 3 perfis fictícios (Mariana básico, Carlos avançado, Helena full)

## PASSO 4 — Dashboard Clínico Avançado
- [x] Página de Funil com visualização por estágio e chips de contagem
- [x] Fila da equipe com lista de pacientes por perfil e prioridade
- [x] Busca por nome + filtros avançados (status, sexo, texto livre por nome/CPF/email/telefone)
- [x] Detalhe do paciente com radar por eixo clínico (sono, energia, foco, libido, humor, digestão) + gráfico de evolução
- [x] CTA "Validar e enviar protocolo" (bloqueado se houver flag de validação pendente)
- [x] Gráficos Recharts: barras por faixa + funil no dashboard
- [x] Dashboard com funil, faixas de score, alertas e relatos com polling 30s
- [x] Dashboard com busca rápida de pacientes e contadores reais (flags, prescrições ativas, medicamentos)
- [x] Radar com dados clínicos reais por paciente no PacienteDetalhe (dados de dailyReports)

## PASSO 5 — Painéis por Sistema Clínico (V16)
- [x] Página Sistemas Clínico com visão matricial por 7 sistemas orgânicos
- [x] Painel Cardiovascular: HAS, infarto, AVC, IC, arritmia com status diagnosticado/potencial/em_investigação/descartado
- [x] Painel Metabólico: diabetes, dislipidemia, obesidade, resistência insulínica
- [x] Painel Endócrino: hipotireoidismo, Hashimoto, hipertireoidismo
- [x] Painel Digestivo: intestino, DRGE, esteatose
- [x] Painel Neuro/Humor: ansiedade, depressão, TDAH, insônia
- [x] Sono detalhado: tabela sleep_details com 4 sub-escalas + router CRUD
- [x] Atividade física múltipla: tabela physical_activity_details + router CRUD
- [x] CRUD completo de condições por sistema com status e severidade

## PASSO 6 — Medicamentos como Matriz Dosada
- [x] Tabela medications com nome, dosagem, doença associada, distribuição manhã/tarde/noite
- [x] Interface de cadastro de medicamentos com comprimidos por turno
- [x] Total diário calculado automaticamente
- [x] Regras de polifarmácia e interações (8 regras semeadas: Warfarina+AINEs, Metformina+Contraste, etc.)
- [x] Alerta automático quando limiar de polifarmácia é atingido (5+ e 10+ medicamentos)
- [x] Página Polifarmácia com verificação por paciente e gestão de regras

## PASSO 7 — Validação Humana Configurável e Governança
- [x] Config de fluxo com toggles ON/OFF: pré-triagem enfermagem, validação médico assistente, validação humana obrigatória
- [x] Roteamento por complexidade: urgente→supervisor, alta→médico assistente
- [x] Travas configuráveis na UI: oncologia, gestante, polifarmácia (toggles criados)
- [x] Bloqueio de criação de protocolo quando há flags clínicas pendentes (protocolDocument.create)
- [x] Auto-roteamento de fila por prioridade (urgente→supervisor, alta→médico) via flow config
- [x] Preview clínico com lista de flags pendentes, protocolos existentes e resumo antes de criar protocolo
- [x] Fila da equipe segmentada por perfil (enfermagem, médico assistente, supervisor, não atribuído)
- [x] Página FilaEquipe com contadores, filtros por perfil, iniciar/concluir atendimento

## PASSO 8 — Geração de PDF e Protocolo
- [x] Página Protocolos com criação de documentos (protocolo/anamnese/relatório)
- [x] Assinatura do médico responsável (nome + CRM)
- [x] Envio do protocolo por WhatsApp ou e-mail com marcação de envio
- [ ] Geração de PDF renderizado do protocolo final

## PASSO 9 — Funil Comercial e Captação
- [x] Chips de funil no dashboard com contagem (polling 30s)
- [x] Detecção de abandono com backend (funnel.detectAbandonment) + UI com reativação WhatsApp
- [x] Classificação de alto interesse com backend (funnel.classifyHighInterest) + UI com badges
- [x] Previsão comercial determinística com backend (funnel.commercialForecast) + UI com receita estimada

## PASSO 10 — Multi-clínica e Escalabilidade
- [ ] Tenancy por slug com branding configurável
- [x] Vídeo explicativo por pergunta (campo videoUrl no schema + UI no CRUD de perguntas com expandível)
- [x] Flag informativa V16 para valores altos em escalas (>80% do máximo)
- [x] Recalibragem real V16: score por bloco clínico (CARDIO, META, ENDO, DIGEST, NEURO, SONO, ATIV), ponderação por step (1.3/1.5/1.2/0.8/0.5), cálculo de complexidade (baixa/media/alta/muito_alta)
- [x] 17 testes unitários para scoring-engine V16 (blocos, steps, complexidade, flags, motor actions, bands, raw points)
- [x] WhatsApp por turno com medicações reais do paciente (filtra por morningQty/afternoonQty/nightQty)
- [x] Link do portal do paciente incluído na mensagem WhatsApp automaticamente

## Testes V2
- [x] Testes do motor de score (scoring bands, motor actions, create/update)
- [x] Testes de medication (CRUD, dosage matrix)
- [x] Testes de clinical flags (validation input, statuses)
- [x] Testes do funil comercial (stats, auth)
- [x] Testes de flow config (list, update, auth)
- [x] Testes do dashboard enhanced (patientTimeline, stats)
- [x] 107 testes passando (6 arquivos de teste)

## V3 — Páginas Adicionais
- [x] Página SistemasClinico (visão matricial por 7 sistemas orgânicos)
- [x] Página FilaEquipe (gestão de atendimentos por perfil profissional)
- [x] Página Polifarmácia (regras de interação e verificação por paciente)
- [x] Página Protocolos (criação, assinatura e envio)
