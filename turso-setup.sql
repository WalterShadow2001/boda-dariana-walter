-- =============================================
-- TURSO DATABASE SETUP FOR WEDDING PROJECT
-- Dariana & Walter
-- =============================================
-- Ejecuta este SQL en el Turso SQL Console
-- o con: turso db shell boda-db < turso-setup.sql
-- =============================================

-- 1. Tabla de proyectos (soporta tipo proyecto y rifa)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT DEFAULT 'project' CHECK (type IN ('project', 'raffle')),
  amount_per_number REAL DEFAULT 0,
  total_numbers INTEGER DEFAULT 100,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 2. Tabla de ventas
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  client TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'in_progress', 'partial', 'cancelled')),
  quantity INTEGER DEFAULT 1,
  delivery_date TEXT DEFAULT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 3. Tabla de gastos
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  quantity INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 4. Tabla de configuración (meta de ahorro y tema)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  savings_goal REAL DEFAULT 0,
  theme TEXT DEFAULT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Insertar configuración inicial
INSERT OR IGNORE INTO settings (id, savings_goal) VALUES (1, 0);

-- 5. Tabla de autenticación (sesión simple)
CREATE TABLE IF NOT EXISTS auth_session (
  id INTEGER PRIMARY KEY DEFAULT 1,
  is_authenticated INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO auth_session (id, is_authenticated) VALUES (1, 0);

-- =============================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- =============================================
CREATE INDEX IF NOT EXISTS idx_sales_project_id ON sales(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);

-- 6. Tabla de rifas
CREATE TABLE IF NOT EXISTS raffles (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  amount REAL NOT NULL DEFAULT 0,
  total_numbers INTEGER NOT NULL DEFAULT 100,
  winner_number INTEGER DEFAULT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 7. Tabla de participantes de rifas
CREATE TABLE IF NOT EXISTS raffle_participants (
  id TEXT PRIMARY KEY,
  raffle_id TEXT NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  is_paid INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(raffle_id, number)
);

-- Índices para rifas
CREATE INDEX IF NOT EXISTS idx_raffles_project_id ON raffles(project_id);
CREATE INDEX IF NOT EXISTS idx_raffle_participants_raffle_id ON raffle_participants(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_participants_number ON raffle_participants(raffle_id, number);
