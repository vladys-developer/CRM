# Prompt para Antigravity.google — Construcción de CRM

> **Instrucciones:** Copia y pega este prompt completo en Antigravity.google como mensaje inicial del proyecto. Está diseñado para que el agente AI entienda el alcance total, el stack tecnológico, la estructura de base de datos, y construya fase por fase.

---

## PROMPT PRINCIPAL

```
Eres un desarrollador senior full-stack. Vas a construir un CRM empresarial completo para PYMEs llamado "Clientify CRM" (o el nombre que prefieras usar internamente).

El repositorio de GitHub ya está creado y se llama "CRM".
El hosting será en Hostinger (frontend estático/SSR).
La base de datos y backend es Supabase (PostgreSQL + Auth + Realtime + Edge Functions + Storage).

---

## STACK TECNOLÓGICO OBLIGATORIO

- **Frontend:** React 18+ con TypeScript, Vite como bundler
- **UI Framework:** Tailwind CSS + shadcn/ui (componentes)
- **State Management:** Zustand o TanStack Query para server state
- **Routing:** React Router v6
- **Backend/DB:** Supabase (PostgreSQL)
  - Supabase Auth (email/password + OAuth social)
  - Supabase Realtime (WebSocket para dashboard y chat)
  - Supabase Edge Functions (Deno/TypeScript para lógica de negocio)
  - Supabase Storage (archivos adjuntos, imágenes)
  - Row Level Security (RLS) en todas las tablas
- **Hosting:** Build estático desplegado en Hostinger
- **Repo:** GitHub → "CRM"

---

## ESTRUCTURA DEL PROYECTO

Genera esta estructura de carpetas:

```
CRM/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Sidebar, Header, MainLayout
│   │   ├── dashboard/       # Widgets, KPIs, Charts
│   │   ├── contacts/        # ContactList, ContactDetail, ContactForm
│   │   ├── companies/       # CompanyList, CompanyDetail, CompanyForm
│   │   ├── opportunities/   # OpportunityList, Pipeline (Kanban), OpportunityForm
│   │   ├── activities/      # TaskList, TaskForm, CallLog, EmailLog, MeetingForm
│   │   ├── calendar/        # CalendarView, EventForm
│   │   ├── inbox/           # InboxLayout, ConversationList, ChatThread, ContextSidebar
│   │   ├── automations/     # AutomationBuilder, AutomationList, TemplateGallery
│   │   ├── marketing/       # CampaignList, EmailEditor, LandingPageBuilder
│   │   ├── reports/         # ReportDashboard, ChartWidgets, ExportOptions
│   │   └── settings/        # UserSettings, TeamSettings, PipelineConfig, Roles
│   │
│   ├── pages/               # Route-level pages
│   ├── hooks/               # Custom hooks (useContacts, useOpportunities, useRealtime, etc.)
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client config
│   │   ├── api/             # API functions por módulo
│   │   └── utils/           # Helpers, formatters, validators
│   │
│   ├── stores/              # Zustand stores
│   ├── types/               # TypeScript interfaces y types
│   ├── constants/           # Enums, pipeline stages defaults, etc.
│   └── styles/              # Global styles, Tailwind config
│
├── supabase/
│   ├── migrations/          # SQL migrations (schema, RLS, indexes, triggers)
│   ├── functions/           # Edge Functions
│   │   ├── whatsapp-webhook/
│   │   ├── email-sync/
│   │   ├── lead-scoring/
│   │   ├── automation-engine/
│   │   └── ai-enrichment/
│   └── seed.sql             # Datos iniciales (roles, pipeline default, plantillas)
│
├── public/
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## BASE DE DATOS — SCHEMA SQL PARA SUPABASE

Crea las migraciones SQL en `supabase/migrations/` con este schema. TODAS las tablas deben tener RLS habilitado.

### Tablas Core:

```sql
-- ============================================
-- USUARIOS Y EQUIPOS
-- ============================================

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'vendedor'
    CHECK (role IN ('super_admin','admin','sales_manager','vendedor','marketing_manager','marketing_user','soporte','ejecutivo','partner')),
  team_id UUID REFERENCES teams(id),
  timezone TEXT DEFAULT 'Europe/Madrid',
  language TEXT DEFAULT 'es',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- EMPRESAS
-- ============================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name TEXT NOT NULL,
  commercial_name TEXT,
  nif_cif TEXT,
  industry TEXT,
  subsector TEXT,
  type TEXT CHECK (type IN ('B2B','B2C','B2B2C')),
  founded_year INTEGER,
  employee_range TEXT CHECK (employee_range IN ('1-10','11-50','51-200','201-500','500+')),
  annual_revenue NUMERIC,
  parent_company_id UUID REFERENCES companies(id),
  
  -- Contacto corporativo
  headquarters_address JSONB, -- {street, city, postal_code, state, country}
  phone TEXT,
  email TEXT,
  website TEXT,
  social_links JSONB, -- {linkedin, twitter, facebook}
  
  -- Datos comerciales
  status TEXT DEFAULT 'prospecto'
    CHECK (status IN ('prospecto','cliente_activo','cliente_inactivo','ex_cliente','partner')),
  client_type TEXT CHECK (client_type IN ('pequeño','mediano','estratégico','enterprise')),
  tier TEXT CHECK (tier IN ('platinum','gold','silver','bronze')),
  territory TEXT,
  account_manager_id UUID REFERENCES user_profiles(id),
  
  -- Métricas (calculadas vía triggers/functions)
  active_opportunities_value NUMERIC DEFAULT 0,
  total_closed_deals NUMERIC DEFAULT 0,
  ltv NUMERIC DEFAULT 0,
  arr NUMERIC DEFAULT 0,
  mrr NUMERIC DEFAULT 0,
  churn_risk_score INTEGER DEFAULT 0 CHECK (churn_risk_score BETWEEN 0 AND 100),
  next_renewal_date DATE,
  
  -- Auditoría
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CONTACTOS
-- ============================================

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Info personal
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  email_secondary TEXT,
  phone_mobile TEXT,
  phone_landline TEXT,
  phone_whatsapp TEXT,
  job_title TEXT,
  department TEXT,
  date_of_birth DATE,
  gender TEXT,
  preferred_language TEXT DEFAULT 'es',
  timezone TEXT,
  social_links JSONB, -- {linkedin, twitter, facebook}
  avatar_url TEXT,
  
  -- Relación empresa
  company_id UUID REFERENCES companies(id),
  
  -- Dirección
  address JSONB, -- {street, city, postal_code, state, country}
  
  -- Gestión
  status TEXT DEFAULT 'nuevo'
    CHECK (status IN ('nuevo','contactado','calificado','cliente','inactivo','descartado')),
  lead_score INTEGER DEFAULT 0 CHECK (lead_score BETWEEN 0 AND 100),
  source TEXT CHECK (source IN ('formulario','whatsapp','importacion','integracion','referido','evento','web','manual','otro')),
  owner_id UUID REFERENCES user_profiles(id),
  team_id UUID REFERENCES teams(id),
  priority TEXT DEFAULT 'media' CHECK (priority IN ('alta','media','baja')),
  
  -- Métricas calculadas
  total_revenue_generated NUMERIC DEFAULT 0,
  active_opportunities_count INTEGER DEFAULT 0,
  conversion_probability INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  days_since_last_interaction INTEGER DEFAULT 0,
  lifetime_value NUMERIC DEFAULT 0,
  
  -- Flags
  is_blocked BOOLEAN DEFAULT false, -- no enviar comunicaciones
  
  -- Auditoría
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TAGS (polimórfico)
-- ============================================

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE taggables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  taggable_type TEXT NOT NULL CHECK (taggable_type IN ('contact','company','opportunity')),
  taggable_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tag_id, taggable_type, taggable_id)
);

-- ============================================
-- PIPELINES Y ETAPAS
-- ============================================

CREATE TABLE pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  close_probability INTEGER DEFAULT 0 CHECK (close_probability BETWEEN 0 AND 100),
  color TEXT DEFAULT '#3B82F6',
  required_fields JSONB DEFAULT '[]',
  avg_time_benchmark_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pipeline_id, sort_order)
);

-- ============================================
-- OPORTUNIDADES
-- ============================================

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  monetary_value NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  close_probability INTEGER DEFAULT 0,
  estimated_close_date DATE,
  actual_close_date DATE,
  sales_cycle_days INTEGER,
  
  -- Clasificación
  stage_id UUID REFERENCES pipeline_stages(id),
  pipeline_id UUID REFERENCES pipelines(id),
  status TEXT DEFAULT 'abierto' CHECK (status IN ('abierto','ganado','perdido','descartado')),
  type TEXT CHECK (type IN ('nueva_venta','upsell','cross_sell','renovacion')),
  product_category TEXT,
  priority TEXT DEFAULT 'media' CHECK (priority IN ('alta','media','baja')),
  original_source TEXT,
  
  -- Relaciones
  primary_contact_id UUID REFERENCES contacts(id),
  company_id UUID REFERENCES companies(id),
  owner_id UUID REFERENCES user_profiles(id),
  team_id UUID REFERENCES teams(id),
  
  -- Financiero
  discount_global NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  
  -- Competencia
  competitors JSONB DEFAULT '[]',
  competitive_advantages TEXT,
  loss_reason TEXT,
  winning_competitor TEXT,
  
  -- Auditoría
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE opportunity_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  subtotal NUMERIC GENERATED ALWAYS AS ((quantity * unit_price) * (1 - discount / 100)) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ACTIVIDADES (polimórfico)
-- ============================================

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('tarea','llamada','email','reunion','nota')),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Relación polimórfica
  related_to_type TEXT CHECK (related_to_type IN ('contact','company','opportunity')),
  related_to_id UUID,
  
  -- Campos comunes
  status TEXT DEFAULT 'pendiente'
    CHECK (status IN ('pendiente','en_progreso','completada','cancelada','pospuesta')),
  priority TEXT DEFAULT 'media' CHECK (priority IN ('alta','media','baja')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Campos específicos por tipo (JSONB flexible)
  metadata JSONB DEFAULT '{}',
  -- Tarea: {subtasks: [], recurrence: null}
  -- Llamada: {direction: 'inbound'|'outbound', result: '...', recording_url: '', sentiment: ''}
  -- Email: {from, to, cc, subject, body, tracking: {opens, clicks}, thread_id}
  -- Reunión: {type: 'virtual'|'presencial', location, meeting_url, attendees: [], agenda, notes}
  -- Nota: {content (rich text)}
  
  -- Asignación
  assigned_to UUID REFERENCES user_profiles(id),
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CONVERSACIONES E INBOX MULTICANAL
-- ============================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp','email','live_chat','facebook','instagram','telegram','sms')),
  status TEXT DEFAULT 'abierta' CHECK (status IN ('abierta','en_espera','resuelta','cerrada')),
  subject TEXT,
  assigned_to UUID REFERENCES user_profiles(id),
  team_id UUID REFERENCES teams(id),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgente','alta','normal','baja')),
  is_read BOOLEAN DEFAULT false,
  last_message_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  csat_score INTEGER CHECK (csat_score BETWEEN 1 AND 5),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('contact','agent','system','bot')),
  sender_id UUID, -- user_profiles.id si es agent, contacts.id si es contact
  content TEXT,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text','image','video','audio','document','location','template')),
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}', -- canal-específico (whatsapp message_id, email headers, etc.)
  status TEXT DEFAULT 'sent' CHECK (status IN ('pending','sent','delivered','read','failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- AUTOMATIZACIONES
-- ============================================

CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'borrador' CHECK (status IN ('activo','inactivo','borrador','en_prueba')),
  category TEXT CHECK (category IN ('ventas','marketing','soporte','onboarding','custom')),
  
  -- Definición del workflow (JSON del builder visual)
  trigger_config JSONB NOT NULL DEFAULT '{}',
  conditions_config JSONB DEFAULT '[]',
  actions_config JSONB DEFAULT '[]',
  
  -- Métricas
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  status TEXT CHECK (status IN ('success','failed','skipped')),
  actions_completed JSONB DEFAULT '[]',
  actions_failed JSONB DEFAULT '[]',
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- MARKETING
-- ============================================

CREATE TABLE marketing_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'static' CHECK (type IN ('static','dynamic')),
  dynamic_filters JSONB, -- filtros para listas dinámicas
  contact_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE marketing_list_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES marketing_lists(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','unsubscribed','bounced')),
  UNIQUE(list_id, contact_id)
);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('email','whatsapp','sms')),
  status TEXT DEFAULT 'borrador' CHECK (status IN ('borrador','programada','enviando','completada','pausada','cancelada')),
  subject TEXT,
  content JSONB, -- HTML/template content
  template_id TEXT,
  list_id UUID REFERENCES marketing_lists(id),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  -- Métricas
  total_recipients INTEGER DEFAULT 0,
  delivered INTEGER DEFAULT 0,
  opened INTEGER DEFAULT 0,
  clicked INTEGER DEFAULT 0,
  bounced INTEGER DEFAULT 0,
  unsubscribed INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- AUDITORÍA GLOBAL
-- ============================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'export', etc.
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_contacts_owner ON contacts(owner_id);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_lead_score ON contacts(lead_score DESC);

CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_account_manager ON companies(account_manager_id);

CREATE INDEX idx_opportunities_stage ON opportunities(stage_id);
CREATE INDEX idx_opportunities_pipeline ON opportunities(pipeline_id);
CREATE INDEX idx_opportunities_owner ON opportunities(owner_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_close_date ON opportunities(estimated_close_date);

CREATE INDEX idx_activities_related ON activities(related_to_type, related_to_id);
CREATE INDEX idx_activities_assigned ON activities(assigned_to);
CREATE INDEX idx_activities_due_date ON activities(due_date);
CREATE INDEX idx_activities_type ON activities(type);

CREATE INDEX idx_conversations_contact ON conversations(contact_id);
CREATE INDEX idx_conversations_assigned ON conversations(assigned_to);
CREATE INDEX idx_conversations_status ON conversations(status);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);

-- ============================================
-- RLS POLICIES (ejemplo para contacts, replicar patrón en todas las tablas)
-- ============================================

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Super admin y admin ven todo
CREATE POLICY "admins_full_access" ON contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- Sales managers ven su equipo
CREATE POLICY "managers_team_access" ON contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'sales_manager'
      AND team_id = contacts.team_id
    )
  );

-- Vendedores ven solo los suyos
CREATE POLICY "owners_own_access" ON contacts
  FOR ALL USING (
    owner_id = auth.uid()
  );

-- Habilitar RLS en TODAS las tablas siguiendo este mismo patrón
```

---

## SEED DATA INICIAL (supabase/seed.sql)

```sql
-- Pipeline por defecto
INSERT INTO pipelines (id, name, is_default) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Pipeline Principal', true);

INSERT INTO pipeline_stages (pipeline_id, name, sort_order, close_probability, color) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Prospección', 1, 10, '#94A3B8'),
  ('00000000-0000-0000-0000-000000000001', 'Calificación', 2, 20, '#60A5FA'),
  ('00000000-0000-0000-0000-000000000001', 'Propuesta', 3, 40, '#FBBF24'),
  ('00000000-0000-0000-0000-000000000001', 'Negociación', 4, 60, '#F97316'),
  ('00000000-0000-0000-0000-000000000001', 'Cierre', 5, 80, '#A78BFA'),
  ('00000000-0000-0000-0000-000000000001', 'Ganado', 6, 100, '#34D399'),
  ('00000000-0000-0000-0000-000000000001', 'Perdido', 7, 0, '#F87171');

-- Tags predefinidos
INSERT INTO tags (name, color) VALUES
  ('VIP', '#EF4444'),
  ('Hot Lead', '#F97316'),
  ('Nurturing', '#3B82F6'),
  ('Referido', '#8B5CF6'),
  ('Renovación', '#10B981'),
  ('En Riesgo', '#F59E0B');
```

---

## PLAN DE CONSTRUCCIÓN POR FASES

Construye el proyecto en este orden exacto. NO avances a la siguiente fase sin completar la anterior.

### FASE 1 — MVP CORE (Construir primero)

1. **Setup inicial:** Vite + React + TypeScript + Tailwind + shadcn/ui + Supabase client
2. **Auth:** Login/Registro con Supabase Auth, protección de rutas, perfil de usuario
3. **Layout principal:** Sidebar colapsable, Header con búsqueda global, tema claro/oscuro
4. **Contactos:** CRUD completo, vista lista (tabla con filtros/búsqueda/paginación), vista detalle con timeline
5. **Empresas:** CRUD completo, relación con contactos, vista lista y detalle
6. **Oportunidades:** CRUD, vista lista + vista Pipeline Kanban (drag & drop con @dnd-kit/sortable)
7. **Pipeline:** Configuración de etapas, indicadores de color por salud del deal
8. **Actividades:** Tareas, notas, llamadas, emails — creación y listado con filtros
9. **Dashboard:** KPIs básicos (pipeline value, win rate, actividades pendientes), gráficos con Recharts
10. **Importación/Exportación:** CSV import con mapeo de campos, CSV/Excel export

### FASE 2 — Comunicación y Productividad

11. **Inbox multicanal:** Layout 3 columnas (lista | chat | contexto), WhatsApp + Email
12. **Calendario:** Vista semanal/mensual con FullCalendar.js, sincronización
13. **Automatizaciones básicas:** Motor de triggers/acciones, plantillas predefinidas
14. **Reportes predefinidos:** Ventas, pipeline, actividad — con Recharts
15. **Responsive/Mobile:** Adaptación completa para móviles

### FASE 3 — IA y Marketing

16. **IA:** Lead scoring automático, sugerencias de próxima acción, enriquecimiento de datos
17. **Automatizaciones avanzadas:** Builder visual drag & drop
18. **Marketing:** Campañas email, listas de segmentación, landing pages
19. **Integraciones:** WhatsApp Business API, Gmail/Outlook sync, Stripe
20. **API pública:** REST API documentada con Swagger

### FASE 4 — Avanzado

21. **Chatbot IA:** NLP para inbox, respuestas automáticas, calificación de leads
22. **Forecasting predictivo**
23. **Análisis de sentimiento**
24. **Gamificación:** Leaderboards, badges para vendedores
25. **Marketplace de integraciones**

---

## REQUISITOS DE DISEÑO UI/UX

- **Estilo:** Moderno, minimalista, profesional. Similar a HubSpot/Pipedrive pero más limpio.
- **Colores:** Usa un esquema con primary azul (#3B82F6) y accents profesionales. Modo oscuro obligatorio.
- **Tipografía:** Inter como font principal
- **Componentes:** shadcn/ui como base, personalizar cuando sea necesario
- **Animaciones:** Framer Motion para transiciones suaves (page transitions, modals, sidebar)
- **Responsivo:** Mobile-first, sidebar colapsable en móvil a bottom nav
- **Iconos:** Lucide React
- **Empty states:** Siempre con ilustración y CTA claro
- **Loading states:** Skeletons, no spinners
- **Feedback:** Toast notifications para acciones (sonner)
- **Tablas:** TanStack Table con sorting, filtering, column visibility, pagination
- **Forms:** React Hook Form + Zod validation
- **Drag & Drop:** @dnd-kit para pipeline Kanban y automation builder

---

## REQUISITOS TÉCNICOS CRÍTICOS

1. **TypeScript estricto** — No usar `any`, interfaces tipadas para todo
2. **RLS en Supabase** — TODAS las tablas con Row Level Security
3. **Optimistic updates** — Para mejor UX en operaciones CRUD
4. **Realtime** — Dashboard y inbox con Supabase Realtime subscriptions
5. **Error boundaries** — React error boundaries en cada módulo
6. **Code splitting** — Lazy loading por ruta con React.lazy
7. **SEO básico** — Meta tags, títulos dinámicos con react-helmet-async
8. **Accesibilidad** — ARIA labels, keyboard navigation, focus management
9. **i18n ready** — Textos en archivos de traducción (empezar con español)
10. **ENV variables** — Supabase URL y anon key en .env (nunca hardcodeados)

---

## EMPIEZA AHORA

Comienza con la FASE 1. Crea primero:
1. El setup del proyecto (Vite + dependencias)
2. La configuración de Supabase (client, tipos, auth hook)
3. El layout principal (sidebar + header)
4. El módulo de Contactos completo como referencia para el patrón CRUD

Después de cada módulo, confirma que funciona antes de avanzar al siguiente.
```

---

## NOTAS DE USO

### Para Antigravity.google:
1. Pega el prompt completo como primer mensaje
2. Deja que genere la Fase 1 completa
3. Para las fases siguientes, di: *"Continúa con la Fase 2. El módulo anterior funciona correctamente."*
4. Si necesitas ajustes, sé específico: *"En el módulo de Contactos, añade un campo de búsqueda con debounce de 300ms"*

### Para conectar con Supabase:
- Crea el proyecto en supabase.com
- Copia la URL y anon key al `.env`
- Ejecuta las migraciones SQL en el SQL Editor de Supabase
- Habilita Realtime en las tablas que lo necesiten (contacts, opportunities, conversations, messages)

### Para deploy en Hostinger:
- `npm run build` genera la carpeta `dist/`
- Sube `dist/` a Hostinger via FTP o Git deploy
- Configura las ENV variables en el panel de Hostinger

### Skills en Antigravity:
- Si tienes skills personalizadas cargadas, menciónalas al inicio: *"Usa mis skills [nombre] para [propósito]"*
- Antigravity las aplicará automáticamente si están activas en el workspace
