-- =============================================
-- SUPABASE DATABASE SETUP FOR WEDDING PROJECT
-- Dariana & Walter
-- =============================================
-- Ejecuta este SQL en el SQL Editor de Supabase
-- https://supabase.com/dashboard/project/TU_PROYECTO/sql/new
-- =============================================

-- 1. Tabla de proyectos
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de ventas
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  client TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de gastos
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de configuración (meta de ahorro y tema)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  savings_goal DECIMAL(12,2) DEFAULT 0,
  theme JSONB DEFAULT '{
    "primaryBg": "#FFFEF7",
    "secondaryBg": "#F8E8E8",
    "cardBg": "#FFFFFF",
    "primaryText": "#4A3F3F",
    "secondaryText": "#6B5E5E",
    "mutedText": "#8B7E7E",
    "primaryAccent": "#D4A5A5",
    "secondaryAccent": "#E8C4C4",
    "goldAccent": "#D4AF37",
    "successColor": "#22C55E",
    "warningColor": "#F59E0B",
    "errorColor": "#EF4444",
    "borderColor": "#F0D9D9",
    "inputBorder": "#F0D9D9"
  }',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO settings (id, savings_goal) VALUES (1, 0) ON CONFLICT (id) DO NOTHING;

-- 5. Tabla de autenticación (sesión simple)
CREATE TABLE IF NOT EXISTS auth_session (
  id INTEGER PRIMARY KEY DEFAULT 1,
  is_authenticated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO auth_session (id, is_authenticated) VALUES (1, false) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- =============================================
CREATE INDEX IF NOT EXISTS idx_sales_project_id ON sales(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- Habilitar RLS en todas las tablas
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_session ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir todo (sin autenticación de usuario)
-- Esto permite lectura/escritura pública (para uso simple)
-- Puedes agregar autenticación de usuario más adelante si lo deseas

CREATE POLICY "Allow all access on projects" ON projects
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access on sales" ON sales
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access on expenses" ON expenses
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access on settings" ON settings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access on auth_session" ON auth_session
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- TRIGGERS PARA updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VISTAS ÚTILES
-- =============================================
-- Vista de resumen por proyecto
CREATE OR REPLACE VIEW project_summary AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.created_at,
  COALESCE(SUM(CASE WHEN s.status = 'paid' THEN s.amount ELSE 0 END), 0) as paid_sales,
  COALESCE(SUM(CASE WHEN s.status = 'pending' THEN s.amount ELSE 0 END), 0) as pending_sales,
  COALESCE(SUM(s.amount), 0) as total_sales,
  COALESCE(SUM(e.amount), 0) as total_expenses,
  COALESCE(SUM(s.amount), 0) - COALESCE(SUM(e.amount), 0) as net_profit
FROM projects p
LEFT JOIN sales s ON p.id = s.project_id
LEFT JOIN expenses e ON p.id = e.project_id
GROUP BY p.id, p.name, p.description, p.created_at;

-- =============================================
-- ¡LISTO! 
-- =============================================
-- Después de ejecutar este SQL:
-- 1. Ve a Settings > API en Supabase
-- 2. Copia el "Project URL" y "anon public key"
-- 3. Agrega estos valores en Vercel como variables de entorno
